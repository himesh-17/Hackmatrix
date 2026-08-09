import requests
import json
import os

OSDR_BASE = "https://visualization.osdr.nasa.gov/biodata/api/v2"
DATASETS = ["OSD-104", "OSD-105", "OSD-379", "OSD-48", "OSD-599", "OSD-326"]


def fetch_dataset(osd_id: str) -> dict:
    url = f"{OSDR_BASE}/dataset/{osd_id}/"
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    raw = resp.json()
    return raw.get(osd_id, raw)


def extract_text(data: dict) -> str:
    meta = data.get("metadata", data)
    parts = []

    # Key metadata fields (space-separated keys)
    field_map = {
        "title": ["study title", "project title"],
        "description": ["study description"],
        "organism": ["organism"],
        "material_type": ["material type"],
        "assay_type": ["study assay technology type"],
        "mission": ["mission", "flight program"],
        "factor_name": ["study factor name"],
        "factor_value": ["factor value"],
    }

    for label, keys in field_map.items():
        for key in keys:
            val = meta.get(key)
            if val:
                if isinstance(val, list):
                    val = "; ".join(str(v) for v in val)
                parts.append(f"{label}: {val}")

    # Characteristics
    chars = meta.get("characteristics", [])
    if isinstance(chars, list):
        for c in chars[:10]:
            if isinstance(c, dict):
                parts.append(f"characteristic: {c.get('category', '')} = {c.get('text', '')}")
            elif isinstance(c, str):
                parts.append(f"characteristic: {c}")

    # Factor values
    factors = meta.get("factor value", [])
    if isinstance(factors, list):
        for f in factors[:10]:
            if isinstance(f, dict):
                parts.append(f"factor_value: {f.get('category', '')} = {f.get('text', '')}")

    return "\n".join(parts)


def fetch_all(save_dir: str = "data") -> list[dict]:
    os.makedirs(save_dir, exist_ok=True)
    docs = []

    for osd_id in DATASETS:
        print(f"Fetching {osd_id}...")
        try:
            data = fetch_dataset(osd_id)
            text = extract_text(data)
            docs.append({
                "osd_id": osd_id,
                "text": text,
                "metadata": {
                    "source": "OSDR",
                    "osd_id": osd_id,
                    "url": f"https://osdr.nasa.gov/osdr/datasets/{osd_id}"
                }
            })
            print(f"  OK - {len(text)} chars")
        except Exception as e:
            print(f"  FAIL - {e}")

    out_path = os.path.join(save_dir, "osdr_documents.json")
    with open(out_path, "w") as f:
        json.dump(docs, f, indent=2)
    print(f"\nSaved {len(docs)} documents to {out_path}")
    return docs


if __name__ == "__main__":
    fetch_all()
