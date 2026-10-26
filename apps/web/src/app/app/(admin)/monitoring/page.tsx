import PageLayout from "@/components/page-layout"
import PageHeader from "@/components/page-layout/header"

const MonitoringPage = () => {
    return (
        <PageLayout>
            <PageHeader
                title="Monitoring"
                description="État des microservices, lag Kafka et workflows Argo en cours."
            />
        </PageLayout>
    )
}

export default MonitoringPage