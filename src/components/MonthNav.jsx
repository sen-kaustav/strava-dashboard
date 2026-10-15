import { ChevronLeft, ChevronRight } from './Icons.jsx';

export default function MonthNav({ canPrev, canNext, onPrev, onNext }) {
  return (
    <div className="month-nav">
      <button type="button" className="round-btn" aria-label="Previous month" onClick={onPrev} disabled={!canPrev}><ChevronLeft /></button>
      <button type="button" className="round-btn" aria-label="Next month" onClick={onNext} disabled={!canNext}><ChevronRight /></button>
    </div>
  );
}
