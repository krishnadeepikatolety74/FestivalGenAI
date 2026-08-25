import shutil
import os

brain_dir = r"C:\Users\kooki\.gemini\antigravity-ide\brain\88a70f4b-6140-490a-a83e-2f518e675c40"
assets_dirs = [r"client\public\assets", r"dist\public\assets"]

# Step 1: Copy the newly generated images from the brain folder
generated_mappings = {
    "festival_navratri_1787596042540.jpg": "navratri.png",
    "festival_durga_puja_1787596065725.jpg": "durga_puja.png",
    "festival_mysore_dasara_1787596089706.jpg": "mysore_dasara.png"
}

for dest_dir in assets_dirs:
    os.makedirs(dest_dir, exist_ok=True)
    
    # Copy from brain folder
    for src_name, dest_name in generated_mappings.items():
        src_path = os.path.join(brain_dir, src_name)
        dest_path = os.path.join(dest_dir, dest_name)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dest_path)
            print(f"Copied generated asset {src_name} to {dest_path}")

    # Copy / duplicate matching local assets
    asset_pairings = [
        ("festival-dussehra.jpg", "dussehra.png"),
        ("festival-holi.jpg", "holi.png"),
        ("festival-eid.jpg", "eid_ul_fitr.png"),
        ("festival-sankranti.jpg", "makar_sankranti.png"),
        ("festival-pongal.jpg", "pongal.png"),
        ("festival-sankranti.jpg", "bihu.png"),
        ("festival-sankranti.jpg", "baisakhi.png"),
        ("festival-sankranti.jpg", "ugadi.png"),
        ("festival-sankranti.jpg", "gudi_padwa.png"),
        ("festival-onam.jpg", "vishu.png"),
    ]
    
    for src_name, dest_name in asset_pairings:
        src_path = os.path.join(dest_dir, src_name)
        dest_path = os.path.join(dest_dir, dest_name)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dest_path)
            print(f"Paired pre-existing {src_name} to {dest_path}")
            
    # For general fallbacks, copy diwali.png to the rest of the files to prevent any broken paths
    fallback_destinations = [
        "bhai_dooj.png", "chhath_puja.png", "pushkar_fair.png", "guru_nanak_jayanti.png",
        "hornbill_festival.png", "lohri.png", "vasant_panchami.png", "republic_day.png",
        "kumbh_mela.png", "maha_shivaratri.png", "ram_navami.png", "mahavir_jayanti.png",
        "good_friday.png", "easter.png", "akshaya_tritiya.png", "buddha_purnima.png"
    ]
    
    src_diwali = os.path.join(dest_dir, "diwali.png")
    if os.path.exists(src_diwali):
        for dest_name in fallback_destinations:
            dest_path = os.path.join(dest_dir, dest_name)
            shutil.copy2(src_diwali, dest_path)
            print(f"Paired general fallback diwali.png to {dest_path}")
