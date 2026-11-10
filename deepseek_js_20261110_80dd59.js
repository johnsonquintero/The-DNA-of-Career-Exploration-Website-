// Sim routing by matched role:
const simDone = get('biotech_sim_complete') === 'true';
const cfDone = get('biotech_centrifuge_complete') === 'true';
const role = get('biotech_matched_role') || 'DNA Analyst';

// Forensic/DNA roles → CRISPR first, then centrifuge.
// Wet-lab roles (Clinical Tech, QC Micro, Lab Assistant) → centrifuge first.
const wetLabRoles = ['Clinical Technician','Quality Systems Specialist','Discovery Research Scientist','Bioprocess Engineer'];
const startWithCentrifuge = wetLabRoles.includes(role);

if (!cfDone) {
  simBtn.href = startWithCentrifuge || simDone ? 'centrifuge.html' : 'crispr.html';
  simBtn.querySelector('.btn-text').textContent = startWithCentrifuge || simDone
    ? 'CENTRIFUGE SIMULATION' : 'CRISPR SIMULATION';
}