"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "@/components/home/Clock";
import { ActionTile } from "@/components/home/ActionTile";
import { MeetingList } from "@/components/home/MeetingList";
import { JoinModal } from "@/components/home/JoinModal";
import { api } from "@/lib/api";
import { Video, Plus, Calendar } from "lucide-react";

export default function WorkplaceHome() {
  const router = useRouter();
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [toast, setToast] = useState("");

  const handleNewMeeting = async () => {
    try {
      setCreatingMeeting(true);
      const meeting = await api.createInstantMeeting() as { meeting_code: string };
      router.push(`/meeting/${meeting.meeting_code}/join`);
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : "Failed to create meeting");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setCreatingMeeting(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-[800px] mx-auto p-8 pt-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-[#FF0055] text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Clock */}
      <Clock />

      {/* Action Tiles */}
      <div className="flex gap-10 justify-center my-10">
        <ActionTile
          label="New meeting"
          color="var(--orange-new)"
          icon={<Video className="w-8 h-8 fill-current" strokeWidth={1.5} />}
          onClick={handleNewMeeting}
          loading={creatingMeeting}
          hasDropdown
        />
        <ActionTile
          label="Join"
          color="var(--blue-tile)"
          icon={<Plus className="w-10 h-10" strokeWidth={2} />}
          onClick={() => setIsJoinOpen(true)}
        />
        <ActionTile
          label="Schedule"
          color="var(--blue-tile)"
          icon={
            <div className="relative flex items-center justify-center">
              <Calendar className="w-8 h-8" strokeWidth={1.5} />
              <span className="absolute top-[12px] text-[10px] font-bold">19</span>
            </div>
          }
          onClick={() => router.push("/meetings/schedule")}
        />
      </div>

      {/* Meeting Lists */}
      <div className="w-full flex flex-col md:flex-row gap-6 mt-6">
        <div className="flex-1 min-w-0">
          <MeetingList type="upcoming" />
        </div>
        <div className="flex-1 min-w-0">
          <MeetingList type="recent" />
        </div>
      </div>

      {/* Modals */}
      {isJoinOpen && <JoinModal onClose={() => setIsJoinOpen(false)} />}
    </div>
  );
}
