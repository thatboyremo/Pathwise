export const DASHBOARD_UPDATED_EVENT = "Pathwise:dashboard-updated";

export function notifyDashboardUpdated() {
  window.dispatchEvent(
    new CustomEvent(DASHBOARD_UPDATED_EVENT)
  );
}