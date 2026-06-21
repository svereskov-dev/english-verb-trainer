export interface ProgressRecord {
  id: string;           
  type: "verbform" | "tenserecognition" | "irregular" | "gapfill";
  verbInfinitive: string;
  easeFactor: number;   
  interval: number;     
  dueDate: number;      
  successCount: number;
  failureCount: number;
  lastReviewDate: number;
}

export function updateSRS(record: ProgressRecord, correct: boolean): ProgressRecord {
  if (correct) {
    record.successCount++;
    if (record.interval === 0) record.interval = 1;
    else if (record.interval === 1) record.interval = 6;
    else record.interval = Math.round(record.interval * record.easeFactor);
    record.easeFactor = Math.max(1.3, record.easeFactor + 0.1);
  } else {
    record.failureCount++;
    record.interval = 1;
    record.easeFactor = Math.max(1.3, record.easeFactor - 0.2);
  }
  record.dueDate = Date.now() + record.interval * 86400000;
  record.lastReviewDate = Date.now();
  return record;
}
