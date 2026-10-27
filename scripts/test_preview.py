import io
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from preview import PreviewHandler, ITEMS, register


class PreviewTests(unittest.TestCase):
    def handler(self, path, origin=None):
        handler = PreviewHandler.__new__(PreviewHandler)
        handler.path = path
        handler.headers = {'Host': '127.0.0.1:8000', 'Content-Type': 'application/json'}
        if origin:
            handler.headers['Origin'] = origin
        handler.server = SimpleNamespace(server_port=8000, picker=Path('/QA.app/Contents/MacOS/QA'))
        handler.wfile = io.BytesIO()
        handler.send_response = lambda status: setattr(handler, 'status', status)
        handler.send_header = lambda *args: None
        handler.end_headers = lambda: None
        return handler

    def test_other_origins_cannot_open_picker(self):
        handler = self.handler('/__local_picker/pick', 'https://example.com')
        with patch('preview.subprocess.run') as run:
            handler.do_POST()
        self.assertEqual(handler.status, 403)
        run.assert_not_called()

    def test_unknown_token_cannot_read_arbitrary_path(self):
        handler = self.handler('/__local_picker/items/../../etc/passwd')
        handler.do_GET()
        self.assertEqual(handler.status, 404)

    def test_mixed_selection_returns_both_kinds(self):
        import json
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'folder').mkdir()
            (root / 'file.txt').write_text('test')
            handler = self.handler('/__local_picker/pick', 'http://127.0.0.1:8000')
            def complete_picker(args, **kwargs):
                Path(args[-1]).write_text(json.dumps([str(root / 'folder'), str(root / 'file.txt')]))
            with patch('preview.subprocess.run', side_effect=complete_picker):
                handler.do_POST()
            self.assertEqual(handler.status, 200)
            self.assertEqual([item['kind'] for item in json.loads(handler.wfile.getvalue())['items']], ['directory', 'file'])

    def test_cancel_returns_no_items(self):
        handler = self.handler('/__local_picker/pick', 'http://127.0.0.1:8000')
        with patch('preview.subprocess.run', side_effect=lambda args, **kwargs: Path(args[-1]).write_text('[]')):
            handler.do_POST()
        self.assertEqual(handler.status, 200)
        self.assertEqual(handler.wfile.getvalue(), b'{"items": []}')

    def test_folder_listing_is_lazy_and_excludes_external_links(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'child').mkdir()
            (root / 'file.txt').write_text('test')
            (root / 'outside').symlink_to('/etc')
            selected = register(root)
            handler = self.handler('/__local_picker/items/' + selected['token'])
            handler.do_GET()
            import json
            items = json.loads(handler.wfile.getvalue())['items']
            self.assertEqual([item['name'] for item in items], ['child', 'file.txt'])
            self.assertNotIn(str(root), handler.wfile.getvalue().decode())

    def test_text_preview_limits_bytes_and_full_download_keeps_file(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / 'large.txt'
            file.write_bytes(b'x' * 240000)
            selected = register(file)
            preview = self.handler('/__local_picker/items/' + selected['token'] + '?text=1')
            preview.do_GET()
            self.assertEqual(len(preview.wfile.getvalue()), 200000)
            full = self.handler('/__local_picker/items/' + selected['token'])
            full.do_GET()
            self.assertEqual(len(full.wfile.getvalue()), 240000)

    def tearDown(self):
        ITEMS.clear()


if __name__ == '__main__':
    unittest.main()
