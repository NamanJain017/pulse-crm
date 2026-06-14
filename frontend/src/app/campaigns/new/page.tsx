import { PageHeader } from "@/components/layout/PageHeader";
import { CampaignForm } from "@/components/campaigns/CampaignForm";

export default function NewCampaignPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="New Campaign"
        description="Create a campaign manually — pick a segment, channel, and message style"
      />
      <CampaignForm />
    </div>
  );
}
