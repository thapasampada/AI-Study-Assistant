import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Sparkles, BookOpen, Lightbulb } from 'lucide-react'
import aiService from '../../services/aiService'
import toast from 'react-hot-toast'
import MarkdownRenderer from '../common/MarkdownRenderer'
import Button from '../common/Button'
import Modal from '../common/Modal'

const primaryButtonClasses =
    'inline-flex items-center justify-center h-10 px-5 rounded-xl bg-linear-to-r from-[#4F9DA6] to-[#3D7F87] hover:from-[#468D95] hover:to-[#356E75] text-white text-sm font-semibold shadow-md shadow-[#4F9DA6]/25 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#4F9DA6]/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'

const spinnerClasses =
    'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'

const AiActions = () => {

    const { id: documentId } = useParams()
    const [loadingAction, setLoadingAction] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalContent, setModalContent] = useState('')
    const [modalTitle, setModalTitle] = useState('')
    const [concept, setConcept] = useState('')

    const handleGenerateSummary = async () => {
        setLoadingAction('summary')
        try {
            const { summary } = await aiService.generateSummary(documentId)
            setModalTitle('Document Summary')
            setModalContent(summary)
            setIsModalOpen(true)
        } catch (error) {
            console.error('Error generating summary: ', error)
            toast.error('Failed to generate summary. Please try again.')
        } finally {
            setLoadingAction(null)
        }
    }

    const handleExplainConcept = async (e) => {
        e.preventDefault()
        if (!concept.trim()) {
            toast.error('Please enter a concept to explain.')
            return
        }
        setLoadingAction('explain')
        try {
            const { explanation } = await aiService.explainConcept(documentId, concept)
            setModalTitle('Concept Explanation')
            setModalContent(explanation)
            setIsModalOpen(true)
        } catch (error) {
            console.error('Error explaining concept: ', error)
            toast.error('Failed to explain concept. Please try again.')
        } finally {
            setLoadingAction(null)
        }
    }

    return (
        <>
            <div className="bg-white border border-[#DCE6E8] rounded-2xl overflow-hidden">
                {/*Header*/}
                <div className='px-6 py-5 border-b border-[#DCE6E8] bg-linear-to-br from-[#F7FAFB] to-[#EAF2F2]'>
                    <div className='flex items-center gap-3'>
                        <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-[#4F9DA6] to-[#3D7F87] shadow-md shadow-[#4F9DA6]/20 shrink-0'>
                            <Sparkles className='w-5 h-5 text-white' strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className='text-base font-semibold text-[#2A3439] leading-tight'>AI Assistant</h3>
                            <p className='text-sm text-[#647278]'>Enhance your learning experience with AI-powered actions.</p>
                        </div>
                    </div>
                </div>

                <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-5'>
                    {/*Generate Summary*/}
                    <div className='bg-[#F7FAFB] border border-[#DCE6E8] rounded-xl p-5 hover:border-[#4F9DA6]/50 transition-colors duration-200'>
                        <div className='flex flex-col justify-between gap-5 h-full'>
                            <div className='space-y-2'>
                                <div className='flex items-center gap-2.5'>
                                    <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-[#EAF2F2] shrink-0'>
                                        <BookOpen className='w-4 h-4 text-[#3D7F87]' strokeWidth={2} />
                                    </div>
                                    <h4 className='text-sm font-semibold text-[#2A3439]'>Generate Summary</h4>
                                </div>
                                <p className='text-sm text-[#647278]'>Get a concise summary of the document's content.</p>
                            </div>
                            <button
                                onClick={handleGenerateSummary}
                                disabled={loadingAction !== null}
                                className={`${primaryButtonClasses} w-full sm:w-auto sm:self-start`}>
                                {loadingAction === 'summary' ? (
                                    <span className='inline-flex items-center gap-2'>
                                        <div className={spinnerClasses} />
                                        Loading...
                                    </span>
                                ) : (
                                    "Summarize"
                                )}
                            </button>
                        </div>
                    </div>

                    {/*Explain Concept*/}
                    <div className='bg-[#F7FAFB] border border-[#DCE6E8] rounded-xl p-5 hover:border-[#4F9DA6]/50 transition-colors duration-200'>
                        <form onSubmit={handleExplainConcept} className='flex flex-col h-full'>
                            <div className='flex items-center gap-2.5 mb-2'>
                                <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-[#EAF2F2] shrink-0'>
                                    <Lightbulb className='w-4 h-4 text-[#3D7F87]' strokeWidth={2} />
                                </div>
                                <h4 className='text-sm font-semibold text-[#2A3439]'>Explain Concept</h4>
                            </div>
                            <p className='text-sm text-[#647278] mb-4 flex-1'>Enter a concept or term from the document to get a detailed explanation.</p>
                            <div className='flex flex-col sm:flex-row gap-2'>
                                <input
                                    type='text'
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    placeholder='Enter concept...'
                                    aria-label='Concept to explain'
                                    className='flex-1 min-w-0 h-10 px-4 border-2 border-[#DCE6E8] rounded-xl bg-white text-[#2A3439] placeholder-[#9CB0B4] text-sm font-medium transition-all duration-200 focus:outline-none focus:border-[#4F9DA6] focus:shadow-lg focus:shadow-[#4F9DA6]/10 disabled:opacity-60 disabled:cursor-not-allowed'
                                    disabled={loadingAction !== null}
                                />
                                <Button
                                    type='submit'
                                    disabled={loadingAction !== null || !concept.trim()}
                                    className={primaryButtonClasses}>
                                    {loadingAction === 'explain' ? (
                                        <span className='inline-flex items-center gap-2'>
                                            <div className={spinnerClasses} />
                                            Loading...
                                        </span>
                                    ) : (
                                        "Explain"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/*Result modal*/}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTitle}>
                <div className='max-h-[60vh] overflow-y-auto pr-1 text-sm text-[#2A3439]'>
                    <MarkdownRenderer content={modalContent} />
                </div>
            </Modal>
        </>
    )
}

export default AiActions