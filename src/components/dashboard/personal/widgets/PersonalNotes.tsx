/**
 * PersonalNotes Widget
 * Private journaling and notes
 * Part of Mom's Personal Dashboard
 * NO EMOJIS - CSS VARIABLES ONLY
 */

import React, { useState } from 'react';
import { BookOpen, Plus, Edit, Search } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

interface PersonalNotesProps {
  familyMemberId: string;
}

const PersonalNotes: React.FC<PersonalNotesProps> = ({ familyMemberId }) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Weekly Reflection',
      content: 'Had a good week overall. Made progress on my personal goals...',
      category: 'Reflection',
      created_at: '2025-10-18',
      updated_at: '2025-10-18'
    },
    {
      id: '2',
      title: 'Ideas for Summer',
      content: 'Planning some personal time. Want to try...',
      category: 'Planning',
      created_at: '2025-10-15',
      updated_at: '2025-10-17'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      background: 'var(--gradient-background)',
      border: `1px solid var(--accent-color)`,
      borderRadius: '12px',
      padding: '1.5rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <BookOpen size={20} color="var(--primary-color)" />
          <h3 style={{
            color: 'var(--primary-color)',
            margin: 0,
            fontSize: '1.25rem'
          }}>
            My Notes
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          background: 'var(--accent-color)',
          color: 'var(--secondary-color)',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px'
        }}>
          Private
        </span>
      </div>

      <div style={{
        position: 'relative',
        marginBottom: '1rem'
      }}>
        <Search
          size={16}
          color="var(--text-color)"
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.5
          }}
        />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
            borderRadius: '8px',
            border: `1px solid var(--accent-color)`,
            background: 'var(--background-color)',
            color: 'var(--text-color)',
            fontSize: '0.9375rem'
          }}
        />
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        marginBottom: '1rem'
      }}>
        {filteredNotes.map(note => (
          <div
            key={note.id}
            style={{
              background: 'var(--background-color)',
              border: `1px solid var(--accent-color)`,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '0.5rem'
            }}>
              <h4 style={{
                color: 'var(--text-color)',
                margin: 0,
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                {note.title}
              </h4>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--primary-color)',
                  padding: '0.25rem'
                }}
                aria-label="Edit note"
              >
                <Edit size={16} />
              </button>
            </div>

            <p style={{
              color: 'var(--text-color)',
              opacity: 0.8,
              margin: '0 0 0.5rem 0',
              fontSize: '0.9375rem',
              lineHeight: '1.5',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {note.content}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-color)',
              opacity: 0.6
            }}>
              {note.category && (
                <span style={{
                  background: 'var(--accent-color)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {note.category}
                </span>
              )}
              <span>{new Date(note.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-color)',
            opacity: 0.6
          }}>
            <BookOpen size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
            <p>No notes found</p>
            {searchTerm && <p style={{ fontSize: '0.875rem' }}>Try a different search term</p>}
          </div>
        )}
      </div>

      <button style={{
        background: 'var(--gradient-primary)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem',
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontWeight: '500'
      }}>
        <Plus size={16} />
        New Note
      </button>
    </div>
  );
};

export default PersonalNotes;
