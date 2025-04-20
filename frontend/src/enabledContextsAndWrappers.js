import ThemeWrapper from "@/wrappers/ThemeWrapper";
import {DialogProvider} from "@/contexts/dialogProvider";
import {GlobalFeedbackSnackbarProvider} from "@/contexts/globalFeedbackSnackbarProvider";
import MainLayout from "@/layouts/MainLayout";
import AuthGuard from "@/wrappers/AuthGaurd";

function enabledContextsAndWrappers({children}) {
    return (
        <ThemeWrapper>
            <GlobalFeedbackSnackbarProvider>
                <DialogProvider>
                    <AuthGuard>
                        <MainLayout>
                            {children}
                        </MainLayout>
                    </AuthGuard>
                </DialogProvider>
            </GlobalFeedbackSnackbarProvider>
        </ThemeWrapper>
    );
}

export default enabledContextsAndWrappers;
