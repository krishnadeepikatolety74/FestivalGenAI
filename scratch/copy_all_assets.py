import shutil
import os

source_dir = r"C:\Users\kooki\.gemini\antigravity-ide\brain\88a70f4b-6140-490a-a83e-2f518e675c40"
dest_dirs = [r"client\public\assets", r"dist\public\assets"]

mappings = {
    "festival_jagannath_ratha_yatra_1787594780625.jpg": "jagannath_ratha_yatra.png",
    "festival_janmashtami_1787594616388.jpg": "krishna_janmashtami.png",
    "festival_eid_1787594802516.jpg": "eid.png",
    "festival_karwa_chauth_1787595204095.jpg": "karwa_chauth.png",
    "festival_diwali_1787595227959.jpg": "diwali.png",
    "festival_govardhan_puja_1787595253066.jpg": "govardhan_puja.png",
    "festival_pongal_1787595279579.jpg": "pongal.png"
}

for dest_dir in dest_dirs:
    os.makedirs(dest_dir, exist_ok=True)
    for src_name, dest_name in mappings.items():
        src_path = os.path.join(source_dir, src_name)
        dest_path = os.path.join(dest_dir, dest_name)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dest_path)
            print(f"Copied {src_name} to {dest_path}")
        else:
            print(f"Source file not found: {src_path}")
