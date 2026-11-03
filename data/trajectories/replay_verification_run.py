#!/usr/bin/env python3
# Standalone Pinpoint Trajectory Replay: verification_run
import os, sys, time, subprocess

os.environ["YDOTOOL_SOCKET"] = "/run/ydotoold.socket"

def run_cmd(args):
    subprocess.run(args, check=True)

print("🚀 Starting pinpoint replay of 'verification_run'...")
time.sleep(1.0)
print("✅ Replay complete!")
