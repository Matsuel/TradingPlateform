import PageLayout from '@/components/page-layout'
import PageHeader from '@/components/page-layout/header'
import React from 'react'

const BacktestPage = () => {
    return (
        <PageLayout>
            <PageHeader
                title='Backtests'
                description='Historique des runs de stratégies exécutés.'
            />
        </PageLayout>
    )
}

export default BacktestPage