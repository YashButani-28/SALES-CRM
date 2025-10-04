# Frontend Error Log

Run `npm run dev:log` inside `frontend/` to start Vite and stream all console output into `errlog.txt`.

- The command duplicates terminal output, so you can keep coding while the log accumulates.
- Share snippets from `frontend/errlog.txt` when requesting help; Codex can open the file directly.
- The file is overwritten each time you run `npm run dev:log`.

> Tip: if you want to append instead of overwrite, tweak the script to `vite 2>&1 | tee -a errlog.txt`.
