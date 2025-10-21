/**
 * VictoryRecorderWidget Component
 * Widget version of the Victory Recorder for use in dashboards
 */

import React from 'react';
import VictoryRecorder from './VictoryRecorder';

interface VictoryRecorderWidgetProps {
  familyMemberId: string;
}

const VictoryRecorderWidget: React.FC<VictoryRecorderWidgetProps> = ({ familyMemberId }) => {
  return (
    <div className="victory-recorder-widget">
      <VictoryRecorder familyMemberId={familyMemberId} showInWidget={true} />
    </div>
  );
};

export default VictoryRecorderWidget;
