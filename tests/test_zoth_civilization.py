import json
import os
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def test_civilization_engine_files_and_schema():
    assert os.path.exists(os.path.join(ROOT, "server.js"))
    assert os.path.exists(os.path.join(ROOT, "engine", "simulation.js"))
    assert os.path.exists(os.path.join(ROOT, "public", "index.html"))
    with open(os.path.join(ROOT, "public", "index.html"), "r") as f:
        html = f.read()
    assert "ZOTH CIVILIZATION" in html
    assert "3cIfZg27PdKo2D64Ocfw40X" in html
    assert "GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK" in html


def test_live_civilization_api_status_and_reflections():
    with urllib.request.urlopen("http://127.0.0.1:9393/api/status", timeout=5) as r:
        assert r.status == 200
        data = json.loads(r.read().decode())
        assert "state" in data
        st = data["state"]
        assert st.get("day", 0) >= 1
        assert st.get("totalTicks", 0) > 1000
        assert len(data.get("agents", [])) >= 21
        assert len(data.get("tarotKeys", [])) == 22
