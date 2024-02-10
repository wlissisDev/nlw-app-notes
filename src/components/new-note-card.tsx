import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteCardProps {
    onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
    const [content, setContent] = useState("");
    const [isRecording, setIsRecording] = useState(false);


    function handleStartEditor() {
        setShouldShowOnboarding(false);
    }

    //preciso informar que é uma TextAreaElemente para poder capturar o Value
    function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
        setContent(event.target.value)
        if (event.target.value === '') {
            setShouldShowOnboarding(true);
        }
    }

    function handleSaveNote(event: FormEvent) {
        event.preventDefault();
        if(content === ''){
            return;
        }

        onNoteCreated(content);

        setContent('');

        setShouldShowOnboarding(true);

        toast.success("Nota criada com sucesso!")
    }

    function handleStartRecording() {

        const isSpeechRecognitionAPIAvaliable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

        if(!isSpeechRecognitionAPIAvaliable){
            alert('infelizmente seu navegador não suporta a API de gravação');
            return;
        }

        setIsRecording(true);
        setShouldShowOnboarding(false);

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        speechRecognition = new SpeechRecognitionAPI();

        speechRecognition.lang = 'pt-BR'; //idioma usado pela api
        speechRecognition.continuous = true; //grava até eu mandar parar
        speechRecognition.maxAlternatives = 1; //traz uma alternativa para lavaras que sao mais ficieis de entender
        speechRecognition.interimResults = true; //traz resultado conforme eu for falando
        
        speechRecognition.onresult = (event)=>{
            const transcription = Array.from(event.results).reduce((text, result)=>{
                return text.concat(result[0].transcript)
            },'')
        }

        speechRecognition.onerror = (event)=>{
            console.error(event)
        }

        speechRecognition.start();
    }

    function handleStopRecording() {
        setIsRecording(false);

        if(speechRecognition !== null){
            speechRecognition.stop();
        }
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger className='rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400'>
                <span className='text-sm font-medium text-slate-200'>
                    Adicionar nota
                </span>
                <p className='text-sm leading-6 text-slate-400'>
                    Grave uma nota em áudio que será convertida para texto automaticamente.
                </p>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className='inset-0 fixed bg-black/50' />
                <Dialog.Content className='fixed md:left-1/2 inset-0 md:inset-auto  md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none overflow-hidden'>
                    <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400'>
                        <X className='size-5 hover:text-slate-200' />
                    </Dialog.Close>

                    <form className='flex-1 flex flex-col'>
                        <div className='flex flex-1 flex-col gap-3 p-5'>
                            <span className='text-sm font-medium text-slate-300'>
                                Adicionar Nota
                            </span>
                            {shouldShowOnboarding ? (<p className='text-sm leading-6 text-slate-400'>
                                Comece <button type='button' onClick={handleStartRecording} className='text-lime-400 font-medium hover:underline'>gravando uma nota</button> em áudio ou se preferir <button type='button' onClick={handleStartEditor} className='text-lime-400 font-medium hover:underline'>utilize apenas texto.</button>
                            </p>) : (
                                <textarea
                                    autoFocus
                                    className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                                    onChange={(event) => handleContentChanged(event)}
                                    value={content}
                                />
                            )}

                        </div>

                        {isRecording ? (
                            <button
                                type='button'
                                onClick={handleStopRecording}
                                className='w-full flex  items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100'>
                                <div className='size-3 rounded-full bg-red-500 animate-pulse'/>
                                Gravando! (clique para interromper)
                            </button>) : (
                            <button
                                type='button'
                                onClick={handleSaveNote}
                                className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500'>
                                Salvar nota
                            </button>
                        )}


                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}