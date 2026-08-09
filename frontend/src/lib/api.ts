import type { ResearchAnswer } from '@/types/research';

/**
 * Base URL for the FastAPI backend.
 * Update this when the backend team provides the endpoint.
 */
const _API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
void _API_BASE_URL;

/**
 * Mock response data for development.
 * Remove this once the real API is connected.
 */
const MOCK_RESPONSES: Record<string, ResearchAnswer> = {
  default: {
    answer: `Microgravity has been associated with significant changes in muscle-related molecular pathways, including alterations in gene expression patterns and cellular signaling cascades. Evidence from spaceflight experiments conducted aboard the International Space Station (ISS) demonstrates that prolonged exposure to microgravity induces substantial modifications in pathways involved in muscle maintenance, protein synthesis, and adaptation.

Specifically, studies have observed downregulation of genes associated with muscle hypertrophy and contractile function, while genes linked to muscle atrophy pathways — including the ubiquitin-proteasome pathway and autophagy-related genes — show upregulation. These molecular changes correlate with the well-documented muscle wasting observed in astronauts during extended missions.

Analysis of transcriptomic data from NASA's GeneLab datasets reveals that key transcription factors such as myogenin (MYOG) and myocyte enhancer factor 2 (MEF2) family members exhibit altered expression profiles under microgravity conditions. Additionally, oxidative stress response genes and mitochondrial function-related pathways show significant perturbation.

These findings have implications for developing countermeasures to protect crew health during long-duration spaceflight missions, including potential therapeutic targets for preventing microgravity-induced muscle deconditioning.`,
    sources: [
      {
        datasetId: 'OSD-104',
        title: 'Transcriptomic analysis of mouse skeletal muscle after spaceflight',
        url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-104',
      },
      {
        datasetId: 'OSD-105',
        title: 'Gene expression profiling of C. elegans in microgravity',
        url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-105',
      },
      {
        datasetId: 'OSD-379',
        title: 'Rodent Research-1: Muscle gene expression in spaceflight mice',
        url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-379',
      },
      {
        datasetId: 'OSD-488',
        title: 'ISS crew member skeletal muscle biopsy transcriptomics',
        url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-488',
      },
    ],
  },
};

/**
 * Sends a research question to the backend API.
 */
export async function askResearchQuestion(question: string): Promise<ResearchAnswer> {
  // ─── REAL API CALL (uncomment when backend is ready) ───
  // const response = await fetch(`${_API_BASE_URL}/api/research`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ question }),
  // });
  //
  // if (!response.ok) {
  //   throw new Error(`Research query failed: ${response.statusText}`);
  // }
  //
  // return response.json() as Promise<ResearchAnswer>;

  // ─── MOCK IMPLEMENTATION ───
  await simulateDelay(3000);
  console.log(`[Mock API] Processing question: "${question.slice(0, 50)}..."`);
  return MOCK_RESPONSES.default;
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
