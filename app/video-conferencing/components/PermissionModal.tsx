import Modal from "@/app/video-conferencing/components/Modal";
import { Button } from "../../../components/Button";

interface PermissionModalProps {
  onDismiss: () => void;
  onAllow: () => void;
}

export default function PermissionModal({ onDismiss, onAllow }: PermissionModalProps) {

  return (
    <Modal>
      <h2 className="text-xl font-semibold mb-2">
        Allow to use your microphone and camera
      </h2>
      <p className="text-gray-300 text-sm mb-6">
        Access to Microphone and Camera is required. Enable permissions for Microphone and Camera by clicking &ldquo;Allow&rdquo; on the pop-up.
      </p>
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onDismiss}
          className="hover:bg-gray-700"
        >
          Dismiss
        </Button>
        <Button
          onClick={onAllow}
          className="bg-primary hover:bg-primary-700"
        >
          Allow
        </Button>
      </div>
    </Modal>
  );
}