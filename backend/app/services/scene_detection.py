from scenedetect import detect, ContentDetector
def format_time(seconds: float)->str:
    m=int(seconds//60)
    s=int(seconds%60)
    return f"{m:02d}:{s:02d}"

def _time_to_seconds(time_str:str)->float:
    m,s=time_str.split(":")
    return int(m)*60+int(s)

def detect_scenes(video_path:str,threshold:float=22.0)->list:
    scene_list=detect(video_path,ContentDetector(threshold=threshold))
    scenes=[]
    for i,scene in enumerate(scene_list):
        scenes.append({
            "scene_number":i+1,
            "start_seconds":scene[0].get_seconds(),
            "end_seconds":scene[1].get_seconds(),
            "start":format_time(scene[0].get_seconds()),
            "end":format_time(scene[1].get_seconds())
        })
    return scenes

def find_scene_for_timestamp(timestamp_str: str, scenes: list) -> int:
    t = _time_to_seconds(timestamp_str)
    for scene in scenes:
        if scene["start_seconds"] <= t < scene["end_seconds"]:
            return scene["scene_number"]
    return scenes[-1]["scene_number"] if scenes else 1