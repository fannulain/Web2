import { useState, useCallback } from 'react';
import Header from '../components/common/Header';
import JobForm from '../components/jobs/JobForm';
import JobList from '../components/jobs/JobList';
import JobDetails from '../components/jobs/JobDetails';

export default function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleJobCreated = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleViewJob = useCallback((job) => {
    setSelectedJob(job);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedJob(null);
  }, []);

  const handleRerun = useCallback(() => {
    setSelectedJob(null);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-svh flex flex-col bg-surface-950">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Job creation form */}
        <JobForm onJobCreated={handleJobCreated} />

        {/* Job list */}
        <JobList
          onViewJob={handleViewJob}
          refreshTrigger={refreshTrigger}
        />
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 border-t border-white/5">
        <p className="text-xs text-surface-200/20 text-center">
          TextPulse — NLP Analysis Dashboard • Built with React & Express
        </p>
      </footer>

      {/* Job details modal */}
      {selectedJob && (
        <JobDetails
          job={selectedJob}
          onClose={handleCloseDetails}
          onRerun={handleRerun}
        />
      )}
    </div>
  );
}
