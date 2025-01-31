from app.models.schemas import DeviceCreate, DeviceGPUDetails, DeviceResponse,DeviceSpecResponse, GPUInfo, GPUResponse
from app.core.dependencies import get_db
from typing import List, Dict
import psutil
import platform
import GPUtil
import subprocess
import json
import time

def get_thermal_snapshot(timeout=5):
    try:
        process = subprocess.Popen(["pmset", "-g", "thermlog"], stdout=subprocess.PIPE, text=True)
        
        for line in process.stdout:
            print(line.strip())  # Print the line
            
            # Stop when we detect this message
            if "No thermal warning level has been recorded" in line:
                print("✅ Detected end of data. Stopping process.")
                process.terminate()
                break
        
        # Wait for the process to complete (with timeout)
        process.communicate(timeout=timeout)
    
    except subprocess.TimeoutExpired:
        print("⏳ Timeout reached! Stopping process.")
        process.terminate()

    except Exception as e:
        print(f"⚠️ Error: {e}")
        process.terminate()

def get_macos_gpu_info() -> DeviceGPUDetails:
    """Fetches GPU details on macOS using system_profiler and returns DeviceGPUDetails."""
    try:
        output = subprocess.check_output(["system_profiler", "SPDisplaysDataType", "-json"], text=True)
        gpu_info = json.loads(output)

        # components = subprocess.check_output(["pmset", "-g", "thermlog"], text=True)
        # components_info = json.loads(components)

        # print('components_info-->',components_info)

        gpu_data = gpu_info.get("SPDisplaysDataType", [])

        # get_thermal_snapshot(5)


        # try:
        #    process = subprocess.Popen(["sudo", "powermetrics", "--samplers", "gpu_power", "-i", "2000"],stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        #    start_time = time.time()
        #    while time.time() - start_time < 5:  # Run for the given duration
        #         line = process.stdout.readline()
        #         if "GPU Power (W)" in line:
        #             print(line.strip())
        # except KeyboardInterrupt:
        #     process.terminate()  # Stop on user interrupt

        if not gpu_data:
            return DeviceGPUDetails(
                name="Unknown",
                memory_total_MB="0",
                memory_used_MB="0",
                memory_free_MB="0",
                load_percent=0.0,
                temperature_C=0.0
            )

        # Assume the first GPU is the primary one
        gpu = gpu_data[0]
        return DeviceGPUDetails(
            name=gpu.get("sppci_model", "Unknown"),
            memory_total_MB=gpu.get("spdisplays_vram", "0").split(" ")[0],  # Extract numeric value
            memory_used_MB="0",  # macOS doesn’t expose this directly
            memory_free_MB="0",  # macOS doesn’t expose this directly
            load_percent=0.0,  # No easy way to get load
            temperature_C=0.0  # No easy way to get temp
        )

    except Exception as e:
        print(f"Error retrieving macOS GPU info: {e}")
        return DeviceGPUDetails(
            name="Unknown",
            memory_total_MB="0",
            memory_used_MB="0",
            memory_free_MB="0",
            load_percent=0.0,
            temperature_C=0.0
        )





def get_device_spec() -> Dict[str, str]:

    spec = {
        "name": platform.node(),  # Get the hostname (device name)
        "model": platform.machine(),  # Get machine type (e.g., x86_64)
        "cpu": platform.processor(),  # Get processor name
        "cpu_logical_threads": psutil.cpu_count(logical=True),  # Get total number of CPU cores including hyperthreading
        "cpu_physcial_cores": psutil.cpu_count(logical=False),  # Get total number of CPU cores including hyperthreading
        "ram": f"{round(psutil.virtual_memory().total / (1024 ** 3))} GB",  # RAM in GB
        "storage": f"{round(psutil.disk_usage('/').total / (1024 ** 3))} GB",  # Total disk space in GB
        "os": platform.system(),  # OS name (e.g., Windows, Linux)
    }
    return spec

def get_device_condition() -> Dict[str, str]:
    condition = {
        "status": "healthy" if psutil.cpu_percent() < 90 else "critical",  # CPU usage < 90% considered healthy
        "cpu_usage": f"{psutil.cpu_percent()}%",  # Current CPU usage percentage
        "memory_usage": f"{psutil.virtual_memory().percent}%",  # Current memory usage percentage
        "disk_usage": f"{psutil.disk_usage('/').percent}%",  # Current disk usage percentage
        "battery_level": get_battery_level(),
        "temperature": get_temperature(),
    }
    return condition

def get_battery_level() -> int:
    battery = psutil.sensors_battery()
    if battery:
        return battery.percent
    return 100  # Return 100 if no battery is found (e.g., for a server)

def get_temperature() -> float:
    try:
        temperatures = psutil.sensors_temperatures()
        if "coretemp" in temperatures:
            return temperatures["coretemp"][0].current  # Return the temperature of the first core (if available)
    except AttributeError:
        pass
    return 30.0  # Default temperature if not available



def get_gpu_info() -> DeviceGPUDetails:
    """Fetch GPU details based on the operating system and return a DeviceGPUDetails object."""
    try:
        if platform.system() == "Darwin":

            gpu_list = get_macos_gpu_info()

            print('gpu_list-->',gpu_list)

            return DeviceGPUDetails(
                    name=gpu_list.name,
                    memory_total_MB=gpu_list.memory_total_MB,
                    memory_used_MB=gpu_list.memory_used_MB,
                    memory_free_MB=gpu_list.memory_used_MB,
                    load_percent=0.0,
                    temperature_C=0.0
                )
        else:
            gpu_list = GPUtil.getGPUs()
            if not gpu_list:
                return DeviceGPUDetails(
                    name="Unknown",
                    memory_total_MB="0",
                    memory_used_MB="0",
                    memory_free_MB="0",
                    load_percent=0.0,
                    temperature_C=0.0
                )

            print('gpu_list-->',gpu_list)
            # Assume the first GPU is the primary one
            gpu = gpu_list[0]
            return DeviceGPUDetails(
                name=gpu.name,
                memory_total_MB=str(int(gpu.memoryTotal)),  # Convert int to str
                memory_used_MB=str(int(gpu.memoryUsed)),  # Convert int to str
                memory_free_MB=str(int(gpu.memoryFree)),  # Convert int to str
                load_percent=gpu.load * 100,
                temperature_C=gpu.temperature
            )

    except Exception as e:
        print(f"An error occurred while retrieving GPU information: {e}")
        return DeviceGPUDetails(
            name="Unknown",
            memory_total_MB="0",
            memory_used_MB="0",
            memory_free_MB="0",
            load_percent=0.0,
            temperature_C=0.0
        )

