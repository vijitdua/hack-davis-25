import ThemeWrapper from "@/wrappers/ThemeWrapper";
import {DialogProvider} from "@/contexts/dialogProvider";
import {GlobalFeedbackSnackbarProvider} from "@/contexts/globalFeedbackSnackbarProvider";
import MainLayout from "@/layouts/MainLayout";

function enabledContextsAndWrappers({children}) {
    return (
        <ThemeWrapper>
            <GlobalFeedbackSnackbarProvider>
                <DialogProvider>
                    <MainLayout>
                        {children}
                    </MainLayout>
                </DialogProvider>
            </GlobalFeedbackSnackbarProvider>
        </ThemeWrapper>
    );
}

export default enabledContextsAndWrappers;
