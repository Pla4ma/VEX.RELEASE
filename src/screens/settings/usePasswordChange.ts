import { useCallback, useState } from "react";
import { useUIStore } from "../../store/index";

export function usePasswordChange() {
  const { showToast } = useUIStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({
        message: "Please fill in all password fields",
        type: "error",
        duration: 3000,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({
        message: "New passwords do not match",
        type: "error",
        duration: 3000,
      });
      return;
    }
    if (newPassword.length < 8) {
      showToast({
        message: "Password must be at least 8 characters",
        type: "error",
        duration: 3000,
      });
      return;
    }
    setIsChangingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordFields(false);
    showToast({
      message: "Password changed successfully",
      type: "success",
      duration: 3000,
    });
  }, [currentPassword, newPassword, confirmPassword, showToast]);

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPasswordFields,
    setShowPasswordFields,
    isChangingPassword,
    handleChangePassword,
  };
}
