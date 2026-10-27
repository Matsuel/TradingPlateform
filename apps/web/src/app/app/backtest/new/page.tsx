"use client"
import PageLayout from '@/components/page-layout'
import PageHeader from '@/components/page-layout/header'
import { NewBacktestForm } from '@/features/backtest/new-backtest-form'

const NewBacktestPage = () => {
    return (
        <PageLayout>
            <PageHeader
                title='Nouveau backtest'
                description='Configurez une stratégie : un test sera effectué afin de voir si cette stratégie est la bonne'
            />
            <NewBacktestForm onSubmit={() => console.log("kk")} />
        </PageLayout>
    )
}

export default NewBacktestPage