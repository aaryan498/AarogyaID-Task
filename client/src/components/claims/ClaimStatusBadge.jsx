import Badge from '../ui/Badge'
import { STATUS_TONES } from '../../utils/claims'

export default function ClaimStatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] ?? 'neutral'}>{status}</Badge>
}