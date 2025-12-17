"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { BlueprintViewer } from '@/components/BlueprintViewer';
import { Blueprint } from '@/types/blueprint';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function BlueprintDetailPage() {
  const router = useRouter();
  const params = useParams();
  const blueprintId = params?.id as string;
  
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blueprintId) {
      fetchBlueprint();
    }
  }, [blueprintId]);

  const fetchBlueprint = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/blueprints/${blueprintId}`);
      
      if (response.ok) {
        const data = await response.json();
        setBlueprint(data);
      } else {
        setError('Blueprint not found');
      }
    } catch (err) {
      console.error('Failed to fetch blueprint:', err);
      setError('Failed to load blueprint');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (updatedBlueprint: Blueprint) => {
    setBlueprint(updatedBlueprint);
    // Optionally refresh the data
    await fetchBlueprint();
  };

  const handleDelete = async (blueprintToDelete: Blueprint) => {
    if (confirm(`Are you sure you want to delete "${blueprintToDelete.name}"?`)) {
      try {
        const response = await fetch(`/api/blueprints/${blueprintToDelete.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          router.push('/library');
        } else {
          alert('Failed to delete blueprint');
        }
      } catch (err) {
        console.error('Failed to delete blueprint:', err);
        alert('Failed to delete blueprint');
      }
    }
  };

  const handleDownload = (blueprintToDownload: Blueprint) => {
    window.open(`/api/blueprints/${blueprintToDownload.id}/download`, '_blank');
  };

  const handleRate = async (blueprintToRate: Blueprint, rating: number) => {
    try {
      const response = await fetch(`/api/blueprints/${blueprintToRate.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlueprint({ ...blueprintToRate, rating: data.rating });
      }
    } catch (err) {
      console.error('Failed to rate blueprint:', err);
    }
  };

  const handleAnalyze = async (blueprintToAnalyze: Blueprint) => {
    try {
      const response = await fetch(`/api/blueprints/${blueprintToAnalyze.id}/analyze`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Navigate to analysis results or show in a modal
        // For now, just refresh the blueprint to show updated analysis
        await fetchBlueprint();
      }
    } catch (err) {
      console.error('Failed to analyze blueprint:', err);
    }
  };

  const handleUpdate = async (updatedBlueprint: Blueprint) => {
    setBlueprint(updatedBlueprint);
    await fetchBlueprint();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-foreground-muted">Loading blueprint...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-error mb-4">{error || 'Blueprint not found'}</p>
              <button
                onClick={() => router.push('/library')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Library
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 mb-6 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Blueprint Viewer as Page Content */}
        <BlueprintViewer
          blueprint={blueprint}
          isOpen={true}
          onClose={() => router.back()}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
          onRate={handleRate}
          onAnalyze={handleAnalyze}
          onUpdate={handleUpdate}
          asPage={true}
        />
      </main>
    </div>
  );
}

