import asyncio
import concurrent.futures

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
