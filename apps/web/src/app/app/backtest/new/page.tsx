import PageLayout from '@/components/page-layout'
import PageHeader from '@/components/page-layout/header'

const NewBacktestPage = () => {
    return (
        <PageLayout>
            <PageHeader
                title='Nouveau backtest'
                description='Configurez une stratégie : un test sera effectué afin de voir si cette stratégie est la bonne'
            />
        </PageLayout>
    )
}

export default NewBacktestPage