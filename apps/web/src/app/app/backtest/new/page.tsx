"use client"
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/page-layout'
import PageHeader from '@/components/page-layout/header'
import { useCreateBacktest } from '@/features/backtest/hook'
import { NewBacktestForm } from '@/features/backtest/new-backtest-form'
import { prefix } from '@/lib/path'

const NewBacktestPage = () => {
    const router = useRouter()
    const { mutateAsync, error } = useCreateBacktest()

    return (
        <PageLayout>
            <PageHeader
                title='Nouveau backtest'
                description='Configurez une stratégie : un test sera effectué afin de voir si cette stratégie est la bonne'
            />
            <NewBacktestForm
                onSubmit={async (values) => {
                    await mutateAsync(values)
                    router.push(`${prefix}/backtest`)
                }}
            />
            {error && <p className='text-sm text-destructive'>{error.message}</p>}
        </PageLayout>
    )
}

export default NewBacktestPage
