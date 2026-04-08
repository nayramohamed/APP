import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbHeaderComponent } from '../../shared/components/breadcrumb-header/breadcrumb-header.component';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';

@Component({
  selector: 'app-contact',
  imports: [BreadcrumbHeaderComponent, FeaturesSectionComponent, TranslatePipe, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  isChatOpen = signal<boolean>(false);
  userMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);
  
  formData = {
    fullName: '',
    email: '',
    subject: '',
    message: ''
  };
  
  chatMessages = signal<Array<{text: string, isUser: boolean, time: string}>>([
    {
      text: 'Hello! 👋 How can I help you today?',
      isUser: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  isTyping = signal<boolean>(false);

  constructor(
    private toastr: ToastrService,
    private router: Router
  ) {}

  toggleChat(): void {
    this.isChatOpen.update(val => !val);
  }

  sendMessage(): void {
    const message = this.userMessage().trim();
    if (!message) return;

    const userMsg = {
      text: message,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.chatMessages.update(msgs => [...msgs, userMsg]);
    this.userMessage.set('');

    this.isTyping.set(true);

    setTimeout(() => {
      const botResponse = this.getBotResponse(message);
      const botMsg = {
        text: botResponse,
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.chatMessages.update(msgs => [...msgs, botMsg]);
      this.isTyping.set(false);
    }, 1000);
  }

  getBotResponse(message: string): string {
    const msg = message.toLowerCase();
    
    if (msg.includes('help') || msg.includes('اساعد') || msg.includes('help me')) {
      return '🤝 How can I assist you? You can ask me about:\n• Consumer protection numbers\n• How to contact support\n• Order status\n• Returns & refunds\n• Or just say "support" to go to our support page!';
    }
    
    if (msg.includes('consumer') || msg.includes('protection') || msg.includes('حماية') || msg.includes('مستهلك')) {
      return '📞 **Consumer Protection Numbers:**\n\n• Egypt: 19588\n• USA: 1-800-123-4567\n• UK: 0800 123 456\n• UAE: 800 12345\n\nFor more info, please contact our support team.';
    }
    
    if (msg.includes('support') || msg.includes('دعم') || msg.includes('تواصل')) {
      return '💬 **How to contact support:**\n\n1. 📧 Email: support@freshcart.com\n2. 📞 Phone: +1 (800) 123-4567\n3. 💬 Live chat: Available 24/7\n\nClick the button below to go to our support section!';
    }
    
    if (msg.includes('order') || msg.includes('طلب') || msg.includes('شحن')) {
      return '📦 **Order Help:**\n\n• Track your order in "My Orders" page\n• Shipping takes 3-5 business days\n• Free shipping on orders over 500 EGP\n• Need to cancel? Go to Orders > Cancel\n\nCan I help with anything else?';
    }
    
    if (msg.includes('return') || msg.includes('استرجاع') || msg.includes('refund')) {
      return '🔄 **Returns & Refunds:**\n\n• 30-day return policy\n• Items must be unused\n• Free returns on defective items\n• Refund processed within 5-7 days\n\nContact support to start a return!';
    }
    
    return '😊 Thanks for your message! Our support team will get back to you soon. Meanwhile, you can:\n\n• Call us: +1 (800) 123-4567\n• Email: support@freshcart.com\n• Visit our Support Center below\n\nHow else can I help you?';
  }

  goToSupport(): void {
    const supportSection = document.getElementById('contact-form');
    if (supportSection) {
      supportSection.scrollIntoView({ behavior: 'smooth' });
      this.isChatOpen.set(false);
    }
  }

  goToPage(page: string): void {
    this.router.navigate([`/${page}`]);
    this.isChatOpen.set(false);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    if (!this.formData.fullName.trim()) {
      this.toastr.error('Please enter your full name', 'Validation Error');
      return;
    }
    
    if (!this.formData.email.trim() || !this.isValidEmail(this.formData.email)) {
      this.toastr.error('Please enter a valid email address', 'Validation Error');
      return;
    }
    
    if (!this.formData.subject) {
      this.toastr.error('Please select a subject', 'Validation Error');
      return;
    }
    
    if (!this.formData.message.trim()) {
      this.toastr.error('Please enter your message', 'Validation Error');
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.toastr.success('Your message has been sent successfully!', 'Success');
      
      this.formData = {
        fullName: '',
        email: '',
        subject: '',
        message: ''
      };
      
      this.isSubmitting.set(false);
    }, 1000);
  }
}