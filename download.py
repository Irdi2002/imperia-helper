#!/usr/bin/env python3
import os
import requests

# Configuration
START = 1000
END = 1053
BASE_URL = "https://ihcdn3.ioimg.org/iov6live/images/global_map/view_1/special_resource/special_resource_{Value}.png?v=gm11"
OUTPUT_DIR = "special_resources"

def main():
    # 1. Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 2. Loop through the desired range
    for value in range(START, END + 1):
        url = BASE_URL.format(Value=value)
        filename = f"special_resource_{value}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)

        try:
            # 3. Download
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()  # will raise an HTTPError for bad status

            # 4. Save to disk
            with open(filepath, "wb") as f:
                f.write(resp.content)

            print(f"Downloaded {filename}")

        except requests.HTTPError as e:
            print(f"Failed {filename}: HTTP {resp.status_code}")
        except requests.RequestException as e:
            print(f"Failed {filename}: {e}")

if __name__ == "__main__":
    main()
