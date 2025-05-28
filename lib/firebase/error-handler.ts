import { FirebaseError } from "firebase/app";

// Centralized Firebase error handler
export const getFirebaseErrorMessage = (errorCode: string, language: string) => {
  const errorMessages: Record<string, { pt: string; en: string }> = {
    // Authentication errors
    "auth/email-already-in-use": {
      pt: "Este email já está sendo usado por outra conta.",
      en: "This email is already in use by another account.",
    },
    "auth/invalid-email": {
      pt: "O endereço de email não é válido.",
      en: "The email address is not valid.",
    },
    "auth/operation-not-allowed": {
      pt: "Operação não permitida. Entre em contato com o suporte.",
      en: "Operation not allowed. Please contact support.",
    },
    "auth/weak-password": {
      pt: "A senha é muito fraca. Use pelo menos 6 caracteres.",
      en: "The password is too weak. Use at least 6 characters.",
    },
    "auth/user-disabled": {
      pt: "Esta conta foi desabilitada. Entre em contato com o suporte.",
      en: "This account has been disabled. Contact support.",
    },
    "auth/user-not-found": {
      pt: "Usuário não encontrado. Verifique o email ou crie uma conta.",
      en: "User not found. Check your email or create an account.",
    },
    "auth/wrong-password": {
      pt: "Senha incorreta. Tente novamente.",
      en: "Wrong password. Please try again.",
    },
    "auth/invalid-credential": {
      pt: "Email ou senha incorretos. Verifique suas credenciais.",
      en: "Invalid email or password. Please check your credentials.",
    },
    "auth/too-many-requests": {
      pt: "Muitas tentativas. Tente novamente mais tarde.",
      en: "Too many requests. Try again later.",
    },
    "auth/network-request-failed": {
      pt: "Erro de conexão. Verifique sua internet.",
      en: "Network error. Check your internet connection.",
    },
    "auth/internal-error": {
      pt: "Erro interno. Tente novamente.",
      en: "Internal error. Please try again.",
    },
    "auth/user-token-expired": {
      pt: "Sessão expirada. Faça login novamente.",
      en: "Session expired. Please log in again.",
    },
    "auth/requires-recent-login": {
      pt: "Esta operação requer login recente.",
      en: "This operation requires recent login.",
    },
    "auth/invalid-action-code": {
      pt: "O código de recuperação é inválido ou expirou.",
      en: "The reset code is invalid or has expired.",
    },
    "auth/expired-action-code": {
      pt: "O código de recuperação expirou. Solicite um novo.",
      en: "The reset code has expired. Request a new one.",
    },
    "auth/invalid-continue-uri": {
      pt: "URL de continuação inválida.",
      en: "Invalid continue URL.",
    },
    "auth/missing-continue-uri": {
      pt: "URL de continuação não fornecida.",
      en: "Continue URL not provided.",
    },
    "auth/unauthorized-continue-uri": {
      pt: "URL de continuação não autorizada.",
      en: "Unauthorized continue URL.",
    },

    // Firestore errors
    "permission-denied": {
      pt: "Permissão negada. Verifique suas credenciais.",
      en: "Permission denied. Check your credentials.",
    },
    unavailable: {
      pt: "Serviço temporariamente indisponível. Tente novamente.",
      en: "Service temporarily unavailable. Please try again.",
    },
    "deadline-exceeded": {
      pt: "Tempo limite excedido. Tente novamente.",
      en: "Request timeout. Please try again.",
    },
    "resource-exhausted": {
      pt: "Limite de recursos excedido. Tente novamente mais tarde.",
      en: "Resource limit exceeded. Try again later.",
    },
    "not-found": {
      pt: "Dados não encontrados.",
      en: "Data not found.",
    },
    "already-exists": {
      pt: "Dados já existem.",
      en: "Data already exists.",
    },
    "failed-precondition": {
      pt: "Operação não pode ser executada no estado atual.",
      en: "Operation cannot be executed in current state.",
    },
    aborted: {
      pt: "Operação foi cancelada devido a conflito.",
      en: "Operation was aborted due to conflict.",
    },
    "out-of-range": {
      pt: "Valor fora do intervalo permitido.",
      en: "Value out of allowed range.",
    },
    unimplemented: {
      pt: "Operação não implementada.",
      en: "Operation not implemented.",
    },
    "data-loss": {
      pt: "Perda de dados detectada.",
      en: "Data loss detected.",
    },

    // Storage errors
    "storage/object-not-found": {
      pt: "Arquivo não encontrado.",
      en: "File not found.",
    },
    "storage/bucket-not-found": {
      pt: "Bucket de armazenamento não encontrado.",
      en: "Storage bucket not found.",
    },
    "storage/project-not-found": {
      pt: "Projeto não encontrado.",
      en: "Project not found.",
    },
    "storage/quota-exceeded": {
      pt: "Cota de armazenamento excedida.",
      en: "Storage quota exceeded.",
    },
    "storage/unauthenticated": {
      pt: "Usuário não autenticado para esta operação.",
      en: "User not authenticated for this operation.",
    },
    "storage/unauthorized": {
      pt: "Usuário não autorizado para esta operação.",
      en: "User not authorized for this operation.",
    },
    "storage/retry-limit-exceeded": {
      pt: "Limite de tentativas excedido.",
      en: "Retry limit exceeded.",
    },
    "storage/invalid-checksum": {
      pt: "Checksum do arquivo inválido.",
      en: "Invalid file checksum.",
    },
    "storage/canceled": {
      pt: "Operação cancelada pelo usuário.",
      en: "Operation canceled by user.",
    },
    "storage/invalid-event-name": {
      pt: "Nome do evento inválido.",
      en: "Invalid event name.",
    },
    "storage/invalid-url": {
      pt: "URL inválida fornecida.",
      en: "Invalid URL provided.",
    },
    "storage/invalid-argument": {
      pt: "Argumento inválido fornecido.",
      en: "Invalid argument provided.",
    },
    "storage/no-default-bucket": {
      pt: "Nenhum bucket padrão configurado.",
      en: "No default bucket configured.",
    },
    "storage/cannot-slice-blob": {
      pt: "Não é possível fatiar o arquivo.",
      en: "Cannot slice blob.",
    },
    "storage/server-file-wrong-size": {
      pt: "Tamanho do arquivo no servidor está incorreto.",
      en: "Server file wrong size.",
    },
  };

  const errorMessage = errorMessages[errorCode];
  if (errorMessage) {
    return language === "pt-BR" ? errorMessage.pt : errorMessage.en;
  }

  // Default error message for unknown errors
  return language === "pt-BR" ? "Ocorreu um erro inesperado. Tente novamente." : "An unexpected error occurred. Please try again.";
};

// Helper function to handle any Firebase error
export const handleFirebaseError = (error: unknown, language: string): string => {
  // First check: if it's an object with a code property (this is working based on debug)
  if (error && typeof error === "object" && "code" in error) {
    const errorCode = (error as any).code;
    if (typeof errorCode === "string") {
      return getFirebaseErrorMessage(errorCode, language);
    }
  }

  // Second check: FirebaseError instance
  if (error instanceof FirebaseError) {
    return getFirebaseErrorMessage(error.code, language);
  }

  // Third check: Error object with Firebase error code in message
  if (error instanceof Error) {
    const message = error.message;
    // Look for Firebase error codes in the message
    const firebaseErrorMatch = message.match(/\(([^)]+)\)/);
    if (firebaseErrorMatch && firebaseErrorMatch[1]) {
      const errorCode = firebaseErrorMatch[1];
      // Check if this looks like a Firebase error code
      if (errorCode.includes("/") || errorCode.startsWith("auth/") || errorCode.startsWith("storage/")) {
        return getFirebaseErrorMessage(errorCode, language);
      }
    }
    return error.message;
  }

  // Fallback for unknown error types
  return language === "pt-BR" ? "Ocorreu um erro inesperado. Tente novamente." : "An unexpected error occurred. Please try again.";
};

// Specific error messages for different contexts
export const getContextualErrorMessage = (
  error: unknown,
  language: string,
  context: "login" | "signup" | "reset-password" | "logout" | "dashboard" | "upload" | "delete"
): string => {
  const baseMessage = handleFirebaseError(error, language);

  // Add context-specific prefixes or modifications if needed
  const contextPrefixes = {
    login: language === "pt-BR" ? "Erro no login: " : "Login error: ",
    signup: language === "pt-BR" ? "Erro no cadastro: " : "Signup error: ",
    "reset-password": language === "pt-BR" ? "Erro na recuperação: " : "Reset error: ",
    logout: language === "pt-BR" ? "Erro no logout: " : "Logout error: ",
    dashboard: language === "pt-BR" ? "Erro no dashboard: " : "Dashboard error: ",
    upload: language === "pt-BR" ? "Erro no upload: " : "Upload error: ",
    delete: language === "pt-BR" ? "Erro ao excluir: " : "Delete error: ",
  };

  // For now, return the base message without prefix to keep it clean
  // You can uncomment the line below if you want context prefixes
  // return contextPrefixes[context] + baseMessage;

  return baseMessage;
};
