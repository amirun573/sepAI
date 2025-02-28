import asyncio
import concurrent.futures
import os
import psutil
class AsyncProcessor:
    """Handles multiprocessing execution for heavy tasks."""
    
    def __init__(self, max_workers: int = None):
        """Initialize the ProcessPoolExecutor."""
        self.loop = asyncio.get_event_loop()
        self.executor = concurrent.futures.ProcessPoolExecutor(max_workers=max_workers)

    async def run(self, func, *args):
        """Run a function in a separate process."""
        return await self.loop.run_in_executor(self.executor, func, *args)

    def shutdown(self):
        """Gracefully shut down the executor."""
        self.executor.shutdown(wait=True)

    def _cleanup_processes(self):
        """Detect and kill zombie processes **without killing Uvicorn or main app**."""
        current_pid = os.getpid()  # Get current running process ID
        uvicorn_processes = set()

        # ✅ First, detect active Uvicorn processes
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if "uvicorn" in " ".join(proc.info['cmdline']).lower():
                    uvicorn_processes.add(proc.info['pid'])
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

        # ✅ Now, clean up only orphaned Python processes
        for proc in psutil.process_iter(['pid', 'name', 'ppid']):
            try:
                if (
                    proc.info['pid'] != current_pid  # Skip the main app
                    and "python" in proc.info['name'].lower()
                    and proc.info['ppid'] != current_pid  # Skip parent processes
                    and proc.info['pid'] not in uvicorn_processes  # Don't kill Uvicorn
                ):
                    print(f"🔴 Killing orphaned process: {proc.info['name']} (PID: {proc.info['pid']})")
                    proc.kill()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
