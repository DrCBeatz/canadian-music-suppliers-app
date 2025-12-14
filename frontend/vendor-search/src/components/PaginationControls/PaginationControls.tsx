// PaginationControls.tsx

import React from "react";
import "./PaginationControls.css";

export interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  isLoading?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  pageSize,
  totalCount,
  hasNext,
  hasPrev,
  isLoading = false,
  onPrev,
  onNext,
}) => {
  // Nothing to paginate (or nothing yet).
  if (totalCount <= pageSize) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination__button"
        onClick={onPrev}
        disabled={!hasPrev || isLoading}
      >
        Prev
      </button>

      <div className="pagination__meta" aria-live="polite">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        <span className="pagination__count">({totalCount} results)</span>
      </div>

      <button
        type="button"
        className="pagination__button"
        onClick={onNext}
        disabled={!hasNext || isLoading}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;