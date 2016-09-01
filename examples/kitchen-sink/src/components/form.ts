import { defineComponent, evolve, FormValidationResult } from 'myra/core'
import { nothing } from 'myra/html'
import { section, div, h2, h3, form, p, dl, dt, dd, label, input, select, option, button } from 'myra/html/elements'

const required = (value: string) => ({ 
    valid: !!value,
    errors: []
})

/**
 * Model
 */
type FormData = {
    formField?: string
    oninputDemo?: string
    onchangeDemo?: string
}
type Model = {
    formData: FormData
    formValidationResult?: FormValidationResult
}
const init: Model = {
    formData: {}
}


/**
 * Updates
 */
const onFormSubmitUpdate = (model: Model, formData: FormData, validationResult: FormValidationResult) => 
    evolve(model, m => {
        m.formData = formData
        m.formValidationResult = validationResult
    })

const oninputUpdate = (model: Model, value: string) => 
    evolve(model, m => m.formData = evolve(m.formData, x => x.oninputDemo = value))

const onchangeUpdate = (model: Model, value: string) => 
    evolve(model, m => m.formData = evolve(m.formData, x => x.onchangeDemo = value))


/**
 * View
 */
const view = (m: Model) =>
    section(
        h2('Form example'),    
        div(
            h3('Form data:'),
            dl(Object.keys(m.formData).map(name => 
                [
                    dt(name), 
                    dd((m.formData as any)[name])
                ]
            ))
        ),
        m.formValidationResult ?
            div(
                h3('Form validation result:'),
                m.formValidationResult.valid ? 'Valid' : 'Invalid',
                ...m.formValidationResult.errors,
                dl(Object.keys(m.formValidationResult.fields).map(name => 
                    [
                        dt(name), 
                        dd((m.formValidationResult!.fields as any)[name].valid)
                    ]
                ))
            ) 
            : nothing(),
        form({ onsubmit: { listener: onFormSubmitUpdate, preventDefault: true } },
            div({ 'class': !m.formValidationResult || m.formValidationResult.fields['formField'].valid ? 'form-group' : 'form-group has-error' },
                label({ for: 'formField' }, 'Just a form field'),
                input({ type: 'text',
                        id: 'formField',
                        name: 'formField',
                        validators: [required],
                        'class': 'form-control' })
            ),
            div({ 'class': 'form-group' },
                label({ for: 'oninputDemo' }, 'Oninput demo'),
                input({ type: 'text',
                        id: 'oninputDemo',
                        name: 'oninputDemo',
                        'class': 'form-control',
                        oninput: oninputUpdate }),
                p({ 'class': 'help-text' }, `The value of this field is: ${m.formData.oninputDemo}`)
            ),
            div({ 'class': 'form-group' },
                label({ for: 'onchangeDemo' }, 'Onchange demo'),
                select({ id: 'onchangeDemo',
                         name: 'onchangeDemo',
                         'class': 'form-control',
                         onchange: onchangeUpdate },
                    ...['Choice A', 'Choice B', 'Choice C'].map(c => option(c)) 
                )
            ),
            div(
                button({ type: 'submit', 'class': 'btn btn-primary' },
                    'Submit'
                )
            )
        )
    )


/**
 * Component
 */
export const formComponent = defineComponent({
    name: 'FormComponent',
    init: init,
    view: view
})