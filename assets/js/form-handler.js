/**
 * ============================================================================
 * ELLO MERCANTIL S/A - FORMULÁRIOS & ATENDIMENTO WHATSAPP COMERCIAL
 * ============================================================================
 * 
 * NÚMERO COMERCIAL OFICIAL: +55 51 99719-1616
 * DESTINATÁRIO DE E-MAIL: contato@consorcioello.com.br
 * 
 * PADRÃO DE MENSAGEM DO WHATSAPP (PRIMEIRA PESSOA):
 * Olá! Vim pelo site da *Ello Mercantil* e gostaria de realizar uma simulação de consórcio.
 * 
 * Seguem abaixo meus dados para atendimento:
 * 
 * *DADOS DA SOLICITAÇÃO*
 * 
 * *Nome:* {nome}
 * *Telefone:* {telefone}
 * *E-mail:* {email}
 * *Modalidade:* {modalidade}
 * *Crédito desejado:* {valor}
 * *Mensagem:* {mensagem}
 * 
 * Aguardo o retorno da equipe comercial. Obrigado!
 * ============================================================================
 */
const FORMSPREE_ENDPOINT = ''; // Opcional: ID ou URL HTTPS Formspree para backup por e-mail

(function () {
    'use strict';

    // Número oficial de WhatsApp da Ello Mercantil (+55 51 99719-1616)
    var WHATSAPP_NUMERO = '5551997191616';

    // Validador de formato de e-mail (RFC 5322 simplificada)
    function isValidEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return re.test(email);
    }

    // Validador de telefone brasileiro (fixo ou celular com DDD)
    function isValidBrazilianPhone(phone) {
        var digits = phone.replace(/\D/g, '');
        if (digits.length !== 10 && digits.length !== 11) {
            return false;
        }
        var ddd = parseInt(digits.substring(0, 2), 10);
        if (ddd < 11 || ddd > 99) {
            return false;
        }
        if (digits.length === 11 && digits.charAt(2) !== '9') {
            return false;
        }
        if (digits.length === 10 && !['2', '3', '4', '5'].includes(digits.charAt(2))) {
            return false;
        }
        return true;
    }

    // Máscara dinâmica de telefone brasileiro (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    function applyPhoneMask(input) {
        if (!input) return;
        input.addEventListener('input', function (e) {
            var v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);
            if (v.length > 10) {
                e.target.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
            } else if (v.length > 6) {
                e.target.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6);
            } else if (v.length > 2) {
                e.target.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
            } else if (v.length > 0) {
                e.target.value = '(' + v;
            }
        });
    }

    // Exibição de mensagens de validação / status
    function setStatus(statusEl, type, message) {
        if (!statusEl) return;
        statusEl.className = 'form-messages mb-0 mt-3 ' + (type === 'error' ? 'error' : '');
        statusEl.style.display = 'block';
        statusEl.style.fontWeight = '500';
        statusEl.style.fontSize = '14px';
        statusEl.style.textAlign = 'center';
        if (type === 'error') {
            statusEl.style.color = 'var(--error-color, #dc3545)';
        } else if (type === 'info') {
            statusEl.style.color = 'var(--theme-color, #cdb27b)';
        }
        statusEl.textContent = message;
    }

    function clearStatus(statusEl) {
        if (!statusEl) return;
        statusEl.className = 'form-messages mb-0 mt-3';
        statusEl.style.display = 'none';
        statusEl.textContent = '';
    }

    // Constrói a mensagem em primeira pessoa para o WhatsApp comercial da Ello Mercantil
    function buildWhatsAppMessage(dados) {
        var linhas = [
            'Olá! Vim pelo site da *Ello Mercantil* e gostaria de realizar uma simulação de consórcio.',
            '',
            'Seguem abaixo meus dados para atendimento:',
            '',
            '*DADOS DA SOLICITAÇÃO*',
            ''
        ];

        if (dados.nome) {
            linhas.push('*Nome:* ' + dados.nome);
        }
        if (dados.telefone) {
            linhas.push('*Telefone:* ' + dados.telefone);
        }
        if (dados.email) {
            linhas.push('*E-mail:* ' + dados.email);
        }
        if (dados.modalidade) {
            linhas.push('*Modalidade:* ' + dados.modalidade);
        }
        if (dados.valor) {
            linhas.push('*Crédito desejado:* ' + dados.valor);
        }
        if (dados.mensagem) {
            linhas.push('*Mensagem:* ' + dados.mensagem);
        }

        linhas.push('');
        linhas.push('Aguardo o retorno da equipe comercial. Obrigado!');

        return linhas.join('\n');
    }

    // Obtenção da URL HTTPS do Formspree (caso configurado)
    function getEndpointUrl(form) {
        var endpoint = (form.getAttribute('data-formspree-endpoint') || FORMSPREE_ENDPOINT || '').trim();
        if (!endpoint || endpoint === 'SEU_ID_AQUI') {
            return null;
        }
        if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
            return endpoint;
        }
        return 'https://formspree.io/f/' + endpoint;
    }

    // Inicialização do formulário
    function initForm(form) {
        if (!form) return;

        // Aplica a máscara dinâmica de telefone
        var telInput = form.querySelector('input[type="tel"]') || form.querySelector('input[name="telefone"]');
        if (telInput) {
            applyPhoneMask(telInput);
        }

        var submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
        var statusEl = form.querySelector('.form-messages') || document.getElementById('formStatus') || document.getElementById('homeFormStatus');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearStatus(statusEl);

            // Validação dos campos obrigatórios
            var nomeInput = form.querySelector('[name="nome"]');
            var emailInput = form.querySelector('[name="email"]');
            var telInput = form.querySelector('[name="telefone"]');
            var valorInput = form.querySelector('[name="valor"]');
            var assuntoInput = form.querySelector('[name="assunto"]');
            var msgInput = form.querySelector('[name="mensagem"]');

            var nome = (nomeInput ? nomeInput.value : '').trim();
            var email = (emailInput ? emailInput.value : '').trim();
            var telefone = (telInput ? telInput.value : '').trim();
            var valor = (valorInput ? valorInput.value : '').trim();
            var assunto = (assuntoInput ? assuntoInput.value : '').trim();
            var mensagem = (msgInput ? msgInput.value : '').trim();

            if (!nome || nome.length < 2) {
                setStatus(statusEl, 'error', 'Por favor, informe seu nome completo.');
                if (nomeInput) nomeInput.focus();
                return;
            }

            if (!telefone || !isValidBrazilianPhone(telefone)) {
                setStatus(statusEl, 'error', 'Por favor, informe um telefone válido com DDD (ex: (51) 99999-9999).');
                if (telInput) telInput.focus();
                return;
            }

            if (!email || !isValidEmail(email)) {
                setStatus(statusEl, 'error', 'Por favor, informe um endereço de e-mail válido.');
                if (emailInput) emailInput.focus();
                return;
            }

            if (!valor) {
                setStatus(statusEl, 'error', 'Por favor, informe o valor de crédito desejado.');
                if (valorInput) valorInput.focus();
                return;
            }

            if (!assunto) {
                setStatus(statusEl, 'error', 'Por favor, selecione um serviço.');
                if (assuntoInput) assuntoInput.focus();
                return;
            }

            if (!mensagem || mensagem.length < 3) {
                setStatus(statusEl, 'error', 'Por favor, digite sua mensagem.');
                if (msgInput) msgInput.focus();
                return;
            }

            // Proteção antispam honeypot (se preenchido, é robô)
            var gotchaInput = form.querySelector('[name="_gotcha"]');
            if (gotchaInput && gotchaInput.value) {
                form.reset();
                return;
            }

            // Obtenção da modalidade formatada (texto legível da opção selecionada)
            var modalidade = '';
            if (assuntoInput) {
                if (assuntoInput.selectedIndex >= 0 && assuntoInput.options[assuntoInput.selectedIndex]) {
                    var opt = assuntoInput.options[assuntoInput.selectedIndex];
                    if (opt.value) {
                        modalidade = opt.text.trim();
                    }
                }
                if (!modalidade) {
                    modalidade = assunto;
                }
            }

            // Monta o objeto com os dados preenchidos
            var dados = {
                nome: nome,
                telefone: telefone,
                email: email,
                modalidade: modalidade,
                valor: valor,
                mensagem: mensagem
            };

            // Gera a mensagem padronizada em primeira pessoa
            var textoWhatsApp = buildWhatsAppMessage(dados);
            var whatsappUrl = 'https://api.whatsapp.com/send?phone=' + WHATSAPP_NUMERO + '&text=' + encodeURIComponent(textoWhatsApp);

            // Estado visual do botão
            var originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style="width: 1rem; height: 1rem; border-width: 0.15em; vertical-align: -0.125em;"></span> Abrindo WhatsApp...';
            }

            // Exibe aviso claro (sem confirmação de envio automático, pois o cliente ainda precisa enviar a mensagem)
            setStatus(statusEl, 'info', 'Abrindo o WhatsApp comercial da Ello Mercantil... Por favor, envie a mensagem na conversa.');

            // Opcional: envio em background para o Formspree se configurado
            var endpointUrl = getEndpointUrl(form);
            if (endpointUrl) {
                try {
                    var formData = new FormData(form);
                    fetch(endpointUrl, {
                        method: 'POST',
                        body: formData,
                        headers: { 'Accept': 'application/json' },
                        mode: 'no-cors'
                    }).catch(function () {});
                } catch (err) {}
            }

            // Abre o WhatsApp comercial da Ello Mercantil
            var win = window.open(whatsappUrl, '_blank');
            if (!win || win.closed || typeof win.closed === 'undefined') {
                window.location.href = whatsappUrl;
            }

            // Restaura o botão após o redirecionamento preservando os dados digitados
            setTimeout(function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }, 2000);
        });
    }

    // Inicialização automática dos 3 formulários do site
    function init() {
        var formIds = ['homeContatoForm', 'contatoForm', 'simuladorForm'];
        formIds.forEach(function (id) {
            var form = document.getElementById(id);
            if (form) {
                initForm(form);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
