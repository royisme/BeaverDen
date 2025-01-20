# app/utils/helpers.py
import random
import uuid

def generate_unique_id():
    """生成唯一ID"""
    return str(uuid.uuid4())

def generate_random_avatar_path(seed: str = None):
    """生成随机头像路径"""
    avatar_api_url = "https://api.dicebear.com/{version}/{style}/svg?seed={seed}"
    version = "9.x"
    style = "miniavs"
    if seed:
        random_seed = seed
    else:
        random_seed = random.randint(0, 99)
    return f"{avatar_api_url}/{version}/{style}/svg?seed={random_seed}"
