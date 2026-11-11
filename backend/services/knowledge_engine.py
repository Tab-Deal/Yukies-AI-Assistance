from dataclasses import dataclass
from pathlib import Path
import re

from backend.config import settings


@dataclass
class KBSection:
    file_name: str
    section_title: str
    content: str
    priority: int
    contains_offen: bool
    handle: str | None = None


class YukiesKnowledgeEngine:
    """Loads, indexes, and searches the 19 verified YUKIES Markdown files."""

    def __init__(self, kb_dir: Path | None = None) -> None:
        self.kb_dir = kb_dir or settings.KNOWLEDGE_BASE_DIR
        self.sections: list[KBSection] = []
        self.full_kb_text: str = ""
        self.system_prompt_md: str = ""
        self.formulierungen_md: str = ""
        self._load_all()

    def _determine_priority(self, rel_path: str) -> int:
        if "09_formulierungen" in rel_path:
            return 100
        if "00_system_prompt" in rel_path:
            return 95
        if "07_service_uebergabe" in rel_path or "10_offene_punkte" in rel_path:
            return 92
        if "01_produkte" in rel_path:
            return 90
        return 80

    def _extract_handle(self, text: str) -> str | None:
        match = re.search(r"Shopify-Handle:\s*([a-z0-9\-]+)", text, re.IGNORECASE)
        return match.group(1).strip() if match else None

    def _load_all(self) -> None:
        if not self.kb_dir.exists():
            return

        md_files = sorted(self.kb_dir.rglob("*.md"))
        compiled_blocks: list[str] = []

        for file_path in md_files:
            rel_path = str(file_path.relative_to(self.kb_dir))
            if rel_path == "README.md":
                continue

            raw_text = file_path.read_text(encoding="utf-8").strip()
            if "00_system_prompt.md" in rel_path:
                self.system_prompt_md = raw_text
            if "09_formulierungen.md" in rel_path:
                self.formulierungen_md = raw_text

            compiled_blocks.append(f"--- FILE: {rel_path} ---\n{raw_text}")

            priority = self._determine_priority(rel_path)
            handle = self._extract_handle(raw_text)

            # Split into logical H1/H2 chunks for targeted retrieval
            chunks = re.split(r"\n(?=##\s+)", raw_text)
            for chunk in chunks:
                lines = chunk.strip().splitlines()
                if not lines:
                    continue
                title = lines[0].lstrip("#").strip()
                contains_offen = "[OFFEN]" in chunk
                self.sections.append(
                    KBSection(
                        file_name=rel_path,
                        section_title=title,
                        content=chunk.strip(),
                        priority=priority,
                        contains_offen=contains_offen,
                        handle=handle,
                    )
                )

        self.full_kb_text = "\n\n".join(compiled_blocks)

    def search(self, query: str, top_k: int = 6) -> list[KBSection]:
        """Hybrid keyword + handle + priority retrieval across YUKIES KB."""
        q_lower = query.lower()
        tokens = [
            t
            for t in re.findall(r"\b[a-zäöüß0-9]{3,}\b", q_lower)
            if t not in {"und", "der", "die", "das", "ist", "für", "mit", "von", "the", "and", "for", "with"}
        ]

        scored: list[tuple[float, KBSection]] = []
        for sec in self.sections:
            haystack = f"{sec.file_name} {sec.section_title} {sec.content}".lower()
            score = 0.0
            for tok in tokens:
                if tok in haystack:
                    score += 3.0
                if tok in sec.section_title.lower():
                    score += 4.0
            if sec.handle and sec.handle in q_lower:
                score += 10.0
            if score > 0:
                score += sec.priority / 100.0
                scored.append((score, sec))

        scored.sort(key=lambda item: item[0], reverse=True)
        return [sec for _, sec in scored[:top_k]]


kb_engine = YukiesKnowledgeEngine()
