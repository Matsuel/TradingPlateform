import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageCard } from "./language-card"
import { ThemeCard } from "./theme-card"

/** Onglets des paramètres ; seul « Apparence » existe : thème puis langue. */
export function SettingsTabs() {
    const t = useTranslations("settings.tabs")

    return (
        <Tabs defaultValue="appearance" className="gap-6">
            <TabsList>
                <TabsTrigger value="appearance">{t("appearance")}</TabsTrigger>
            </TabsList>
            <TabsContent value="appearance" className="flex flex-col gap-6">
                <ThemeCard />
                <LanguageCard />
            </TabsContent>
        </Tabs>
    )
}
