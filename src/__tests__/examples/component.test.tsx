import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
interface WalletCardProps {
  coins: number;
  gems: number;
  onAddCoins?: () => void;
  loading?: boolean;
}
const WalletCard: React.FC<WalletCardProps> = ({
  coins,
  gems,
  onAddCoins,
  loading,
}) => {
  return (
    <View testID="wallet-card">
      <Text testID="coins-display">{coins} Coins</Text>
      <Text testID="gems-display">{gems} Gems</Text>

      {loading ? (
        <ActivityIndicator testID="loading-indicator" />
      ) : (
        <Pressable
          testID="add-coins-button"
          onPress={onAddCoins}
          accessibilityLabel="Add coins"
          accessibilityRole="button"
        >
          <Text>+100 Coins</Text>
        </Pressable>
      )}
    </View>
  );
};
interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
}
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const handleSubmit = () => {
    if (!email || !password) {
      setError("Email and password required");
      return;
    }
    setError("");
    onSubmit(email, password);
  };
  return (
    <View testID="login-form">
      <TextInput
        testID="email-input"
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        accessibilityLabel="Email input"
      />
      <TextInput
        testID="password-input"
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        accessibilityLabel="Password input"
      />
      {error ? <Text testID="error-message">{error}</Text> : null}
      <Pressable
        testID="submit-button"
        onPress={handleSubmit}
        accessibilityLabel="Submit"
        accessibilityRole="button"
      >
        <Text>Login</Text>
      </Pressable>
    </View>
  );
};
describe("WalletCard Component", () => {
  it("should render wallet balances correctly", () => {
    render(<WalletCard coins={1000} gems={50} />);
    expect(screen.getByTestId("wallet-card")).toBeTruthy();
    expect(screen.getByTestId("coins-display")).toHaveTextContent("1000 Coins");
    expect(screen.getByTestId("gems-display")).toHaveTextContent("50 Gems");
  });
  it("should display different values", () => {
    render(<WalletCard coins={500} gems={25} />);
    expect(screen.getByTestId("coins-display")).toHaveTextContent("500 Coins");
    expect(screen.getByTestId("gems-display")).toHaveTextContent("25 Gems");
  });
  it("should call onAddCoins when button pressed", () => {
    const mockAddCoins = jest.fn();
    render(<WalletCard coins={1000} gems={50} onAddCoins={mockAddCoins} />);
    fireEvent.press(screen.getByTestId("add-coins-button"));
    expect(mockAddCoins).toHaveBeenCalledTimes(1);
  });
  it("should show loading indicator when loading", () => {
    render(<WalletCard coins={1000} gems={50} loading={true} />);
    expect(screen.getByTestId("loading-indicator")).toBeTruthy();
    expect(screen.queryByTestId("add-coins-button")).toBeNull();
  });
  it("should be accessible", () => {
    render(<WalletCard coins={1000} gems={50} onAddCoins={jest.fn()} />);
    const button = screen.getByLabelText("Add coins");
    expect(button).toBeTruthy();
  });
});
describe("LoginForm Component", () => {
  it("should render all form elements", () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    expect(screen.getByTestId("login-form")).toBeTruthy();
    expect(screen.getByTestId("email-input")).toBeTruthy();
    expect(screen.getByTestId("password-input")).toBeTruthy();
    expect(screen.getByTestId("submit-button")).toBeTruthy();
  });
  it("should update email input value", () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    const emailInput = screen.getByTestId("email-input");
    fireEvent.changeText(emailInput, "test@example.com");
    expect(emailInput.props.value).toBe("test@example.com");
  });
  it("should show error when submitting empty form", () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    fireEvent.press(screen.getByTestId("submit-button"));
    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "Email and password required",
    );
  });
  it("should submit with valid data", () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);
    fireEvent.changeText(screen.getByTestId("email-input"), "user@example.com");
    fireEvent.changeText(screen.getByTestId("password-input"), "password123");
    fireEvent.press(screen.getByTestId("submit-button"));
    expect(mockSubmit).toHaveBeenCalledWith("user@example.com", "password123");
    expect(screen.queryByTestId("error-message")).toBeNull();
  });
  it("should clear error after successful validation", () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);
    fireEvent.press(screen.getByTestId("submit-button"));
    expect(screen.getByTestId("error-message")).toBeTruthy();
    fireEvent.changeText(screen.getByTestId("email-input"), "user@example.com");
    fireEvent.changeText(screen.getByTestId("password-input"), "password123");
    fireEvent.press(screen.getByTestId("submit-button"));
    expect(screen.queryByTestId("error-message")).toBeNull();
  });
  it("should have accessible inputs", () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    expect(screen.getByLabelText("Email input")).toBeTruthy();
    expect(screen.getByLabelText("Password input")).toBeTruthy();
    expect(screen.getByLabelText("Submit")).toBeTruthy();
  });
  it("should have password input secured", () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});
