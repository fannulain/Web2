import { useState, useEffect, useCallback } from 'react';
import JobCard from './JobCard';
import { getTasks, deleteTask as apiDeleteTask } from '../../services/api';
import toast from 'react-hot-toast';
import useWebSocket from '../../hooks/useWebSocket';

// Skeleton card
function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-20 h-6 rounded-full animate-shimmer" />
        <div className="w-24 h-4 rounded animate-shimmer" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 rounded animate-shimmer" />
        <div className="w-3/4 h-4 rounded animate-shimmer" />
      </div>
      <div className="w-full h-8 rounded-lg animate-shimmer" />
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-surface-200/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9.75m3 0-3-3m3 3-3 3M3.375 7.5h17.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 0 1-1.125-1.125v-8.25c0-.621.504-1.125 1.125-1.125Z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No analyses yet</h3>
      <p className="text-sm text-surface-200/40 max-w-xs">
        Submit your first text above to start an NLP analysis. Results will appear here.
      </p>
    </div>
  );
}

export default function JobList({ onViewJob, refreshTrigger }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setJobs(data);
    } catch (error) {
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to load tasks');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, refreshTrigger]);

  const handleWsMessage = useCallback((data) => {
    if (data.type === 'TASK_EVENT' || data.type === 'TASK_UPDATE') {
      setJobs((prev) =>
        prev.map((j) => {
          if (j.id === data.taskId) {
            return {
              ...j,
              status: data.status,
              result: data.status === 'PROCESSING' || data.progress
                ? { ...j.result, progress: data.progress }
                : j.result
            };
          }
          return j;
        })
      );
      if (data.status === 'DONE' || data.status === 'ERROR') {
        setTimeout(() => fetchJobs(), 500);
      }
    }
  }, [fetchJobs]);

  const { isConnected: isWsConnected } = useWebSocket(handleWsMessage);
  useEffect(() => {
    if (!isWsConnected) {
      const interval = setInterval(() => {
        fetchJobs();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isWsConnected, fetchJobs]);

  const handleDelete = async (id) => {
    try {
      await apiDeleteTask(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const updateJobInList = useCallback((jobId, newData) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, ...newData } : j))
    );
  }, []);

  useEffect(() => {
    window.__jobList = { refreshJobs: fetchJobs, updateJobInList };
    return () => { delete window.__jobList; };
  }, [fetchJobs, updateJobInList]);

  return (
    <section id="job-list-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Your Analyses</h2>
          <p className="text-sm text-surface-200/40 mt-0.5">
            {loading ? 'Loading…' : `${jobs.length} task${jobs.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button
          id="refresh-jobs-btn"
          onClick={fetchJobs}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium text-surface-200/50 hover:text-white
                     rounded-lg border border-white/8 hover:border-white/15
                     hover:bg-white/5 transition-all duration-200 disabled:opacity-40 cursor-pointer"
        >
          <svg className={`w-4 h-4 inline-block mr-1 ${loading ? 'animate-spin-slow' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : jobs.length === 0 ? (
          <EmptyState />
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onView={onViewJob}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
