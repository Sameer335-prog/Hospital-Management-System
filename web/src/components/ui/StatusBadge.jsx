const STATUS_TONE = {
  Admitted: 'info', OPD: 'neutral', Waiting: 'warning', Discharged: 'neutral', 'Follow-up Due': 'warning',
  'Checked-in': 'info', Confirmed: 'info', 'In Consultation': 'purple', Completed: 'success', Cancelled: 'error',
  'No-show': 'error', Requested: 'neutral', Rescheduled: 'warning',
  Processing: 'info', Urgent: 'error', 'Sample Collected': 'warning', 'Result Ready': 'success', Verified: 'success', Ordered: 'neutral',
  'In Stock': 'success', 'Low Stock': 'warning', 'Out of Stock': 'error', 'Expiring Soon': 'warning',
  Paid: 'success', 'Partially Paid': 'warning', Unpaid: 'error',
  Active: 'success', 'On Leave': 'warning', Inactive: 'neutral', Paused: 'neutral',
  Available: 'success', Occupied: 'error', Reserved: 'warning', Maintenance: 'neutral',
};

export default function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] || 'neutral';
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
