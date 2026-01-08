import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button, Container } from '@/components/ui';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/apartment/01-salon.jpg"
          alt="Salon de l'appartement Au Marais avec poutres apparentes"
          fill
          className="object-cover"
          priority
          quality={85}
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABsRAAICAwEAAAAAAAAAAAAAAAECABEDITFB/9oADAMBAAIRAxEAPwCz4V5FDc3VxaXNtHMYgPWXUlSp5I6PXVXv8gCj6FA2qN+0pR1Xo+aw6WxYCpLGxyWJOT/a0T//2Q=="
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 via-stone-900/40 to-stone-900/70" />
      </div>

      {/* Content */}
      <Container className="relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight animate-fade-in-up">
            Au Marais
          </h1>
          <p className="text-xl md:text-2xl text-stone-200 mb-4 font-light animate-fade-in-up delay-100 opacity-0">
            Votre cocon parisien
          </p>
          <p className="text-lg text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200 opacity-0">
            Appartement de charme au coeur du Marais, entièrement rénové dans un
            immeuble du 17ème siècle. Poutres apparentes, murs en pierres, et la
            ligne 1 à 200 mètres.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300 opacity-0">
            <Link href="/appartement">
              <Button size="lg" className="group">
                Découvrir l&apos;appartement
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white text-white hover:bg-white hover:text-stone-900"
              >
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};
