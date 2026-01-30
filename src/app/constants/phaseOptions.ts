// import { AssessmentIcon, ArchiveIcon, CheckCircleOutlineIcon } from '@mui/icons-material';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import ArchiveIcon from '@mui/icons-material/Archive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export const PHASE_OPTIONS = {
  new: [
    { label: 'Move to Assessment', icon: AssessmentIcon, action: 'skill_assessment' },
    { label: 'Schedule Interview', icon: AssessmentIcon, action: 'interviews' },
    { label: 'Archive', icon: ArchiveIcon , action: 'archived' },
    { label: 'Accept', icon: CheckCircleOutlineIcon , action: 'acceptance' }
  ],
  skill_assessment: [
    { label: 'Schedule Interview', icon: AssessmentIcon , action: 'interviews' },
    { label: 'Archive', icon: ArchiveIcon , action: 'archived' },
    { label: 'Accept', icon: CheckCircleOutlineIcon , action: 'acceptance' }
  ],
  archived: [
    { label: 'Move to Assessment', icon: AssessmentIcon, action: 'skill_assessment' },
    { label: 'Schedule Interview', icon: AssessmentIcon, action: 'interviews' },
    { label: 'Accept', icon: CheckCircleOutlineIcon , action: 'acceptance' },
    { label: 'Archive', icon: ArchiveIcon, action: 'archived' }
  ],
  acceptance: [], // No options for acceptance phase
  interviews: [
    { label: 'Accept', icon: CheckCircleOutlineIcon , action: 'acceptance' },
    { label: 'Archive', icon: ArchiveIcon, action: 'archived' }
  ]
}; 