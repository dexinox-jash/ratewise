import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. When you upgrade, you\'ll be charged the prorated difference. When you downgrade, the new rate will apply at the start of your next billing cycle.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes! All paid plans come with a 14-day free trial. You can cancel anytime during the trial and won\'t be charged.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. For Enterprise plans, we also support invoice payments.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact us within 30 days for a full refund.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      'Your data remains accessible in read-only mode for 30 days after cancellation. After that, you can export your data or it will be permanently deleted.',
  },
];

export function PricingFaq() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible>
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
