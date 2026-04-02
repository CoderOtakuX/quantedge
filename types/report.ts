export interface ReportSlide {
  id: number;
  title: string;
  subtitle: string;
  status: "done" | "active" | "pending";
}

export interface ReportData {
  ticker: string;
  companyName: string;
  slides: ReportSlide[];
  totalSlides: number;
}
