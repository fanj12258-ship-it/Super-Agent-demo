# Local preview

Run `npm run preview`, then open `http://127.0.0.1:8000/workbench/aiops/index.html`.

On macOS with Command Line Tools installed, the preview compiles a small AppKit
helper into the temporary directory. Clicking “文件和文件夹” opens one system
dialog that accepts both files and folders. A folder can be confirmed directly
or double-clicked to select files inside it. The helper exits when the dialog
closes. No application is installed.

Selected items receive temporary opaque URLs. Directory contents are loaded only
when opened in the sidebar; text previews read at most 200 KB. The preview binds
to `127.0.0.1`, checks the request origin, and provides access only to items selected
through the dialog. Files remain local. Restarting the server clears those URLs.

Static hosting and non-macOS previews retain the browser's file upload control;
they cannot offer native mixed file/folder selection through HTML alone.

Run the preview service checks with `PYTHONDONTWRITEBYTECODE=1 python3 scripts/test_preview.py`.
