/**
 * PersonalCalendar Widget
 * Mom's private calendar - hidden from family
 * Part of Mom's Personal Dashboard
 * NO EMOJIS - CSS VARIABLES ONLY
 */

import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface PersonalCalendarProps {
  familyMemberId: string;
}

const PersonalCalendar: React.FC<PersonalCalendarProps> = ({ familyMemberId }) => {
  return (
    <div style={{
      background: 'var(--background-color)',
      border: `1px solid var(--accent-color)`,
      borderRadius: '12px',
      padding: '1.5rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <CalendarIcon size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
      <h3 style={{
        color: 'var(--primary-color)',
        margin: '0 0 0.5rem 0',
        fontSize: '1.25rem'
      }}>
        My Calendar
      </h3>
      <p style={{
        color: 'var(--text-color)',
        opacity: 0.7,
        textAlign: 'center',
        margin: 0,
        fontSize: '0.9375rem'
      }}>
        Personal schedule hidden from family
      </p>
      <p style={{
        color: 'var(--text-color)',
        opacity: 0.5,
        textAlign: 'center',
        margin: '1rem 0 0 0',
        fontSize: '0.875rem'
      }}>
        Calendar integration coming soon
      </p>
    </div>
  );
};

export default PersonalCalendar;
