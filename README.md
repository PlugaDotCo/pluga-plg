# pluga-plg

Pluga developer platform toolbox

### Erros customizados:
Existem tipos específicos de erros que são tratados de diferentes maneiras dentro da plataforma da Pluga. Os detalhes sobre os tipos de  erros suportados e como podem ser utilizados dentro do seu código estão descritos abaixo:

#### AuthError
Erro de autenticação, geralmente necessita de uma ação manual do cliente. Devem ser utilizados em casos onde problema de autenticação impede o funcionamento da integração.

`plg.errors.authError(message: String)`

#### Error
Tipo genérico de erro, erros desse tipo deixam o evento em estado de falha. Devem ser utilizados quando o problema na integração exija uma correção manual por parte do cliente.

 `plg.errors.error(message: String)`

#### RateLimitError

Erros desse tipo permitem que a Pluga realize o processamento dos eventos automaticamente em um momento futuro. Devem ser utilizados quando um recurso torna-se indisponível por conta do limite de uso por exemplo. Você deve fornecer o tempo necessário (em segundos) para que o recurso esteja disponível novamente.

`plg.errors.rateLimitError(message: String, remaining: Integer(seconds))`

#### TransientError

Erros temporários ou transitórios que podem ocorrer por instabilidades, quedas, etc, e que não exigem nenhuma ação manual para o seu correto funcionamento. Eventos com erros desse tipo são reprocessados automaticamente pela plataforma da Pluga.

`plg.errors.transientError(message: String)`

