import requests
import json
import os

OSDR_BASE = "https://osdr.nasa.gov/osdr/api/v2"
DATASETS = ["OSD-104", "OSD-105", "OSD-379"]


def fetch_dataset(osd_id: str) -> dict:
    url = f"{OSDR_BASE}/dataset/{osd_id}/"
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    return resp.json()


def extract_text(data: dict) -> str:
    parts = []
    for key in ["title", "description", "summary", "disease", "organism", "tissue"]:
        val = data.get(key)
        if val and isinstance(val, str):
            parts.append(f"{key}: {val}")
        elif val and isinstance(val, dict):
            parts.append(f"{key}: {val.get('name', str(val))}")

    for study in data.get("studies", []):
        if isinstance(study, dict):
            for key in ["title", "description", "summary"]:
                val = study.get(key)
                if val and isinstance(val, str):
                    parts.append(f"study_{key}: {val}")

    assays = data.get("assayTypes", [])
    if assays:
        parts.append(f"assay_types: {', '.join(str(a) for a in assays)}")

    for f in data.get("factorValues", [])[:10]:
        if isinstance(f, dict):
            parts.append(f"factor: {f.get('name', '')} = {f.get('value', '')}")

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
